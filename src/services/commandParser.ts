import type { Device, ParsedCommandResult, PipelineStage, RoomId, DeviceType, IntentType } from '../types';

export const WAKE_WORD_REGEX = /(?:^|\b)(?:hey\s+)?sofia\b/i;

export function hasWakeWord(text: string): boolean {
  return WAKE_WORD_REGEX.test(text.trim());
}

export function extractCommandAfterWakeWord(text: string): string {
  return text.trim().replace(/(?:^|\b)(?:hey\s+)?sofia[\s,.:!?-]*/i, '').trim();
}

// Helper to normalize number words to digits if spoken (e.g. "twenty two" -> 22)
function parseSpokenNumbers(text: string): string {
  const numberWords: Record<string, string> = {
    zero: '0', one: '1', two: '2', three: '3', four: '4', five: '5',
    six: '6', seven: '7', eight: '8', nine: '9', ten: '10',
    eleven: '11', twelve: '12', thirteen: '13', fourteen: '14', fifteen: '15',
    sixteen: '16', seventeen: '17', eighteen: '18', nineteen: '19', twenty: '20',
    'twenty one': '21', 'twenty-one': '21',
    'twenty two': '22', 'twenty-two': '22',
    'twenty three': '23', 'twenty-three': '23',
    'twenty four': '24', 'twenty-four': '24',
    'twenty five': '25', 'twenty-five': '25',
    'twenty six': '26', 'twenty-six': '26',
    'twenty seven': '27', 'twenty-seven': '27',
    'twenty eight': '28', 'twenty-eight': '28',
    'twenty nine': '29', 'twenty-nine': '29',
    thirty: '30'
  };

  let normalized = text;
  for (const [word, digit] of Object.entries(numberWords)) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    normalized = normalized.replace(regex, digit);
  }
  return normalized;
}

export function parseCommand(
  rawTranscript: string, 
  currentDevices: Device[], 
  options: { requireWakeWord?: boolean } = { requireWakeWord: true }
): ParsedCommandResult {
  const stages: PipelineStage[] = [];
  const cleanedRaw = rawTranscript.trim();

  // STAGE 1: Speech-to-Text Reception
  stages.push({
    step: 1,
    name: 'Speech-to-Text Reception',
    description: 'Received raw audio transcription stream from Web Speech API / input channel',
    input: rawTranscript,
    output: cleanedRaw,
    status: cleanedRaw ? 'success' : 'error',
    details: { characterCount: cleanedRaw.length, source: 'SofiaVoiceEngine' }
  });

  if (!cleanedRaw) {
    return {
      rawTranscript: '',
      preprocessedText: '',
      intent: 'UNKNOWN',
      wakeWordDetected: false,
      confidence: 0,
      validationSuccess: false,
      validationError: 'Empty speech input received.',
      feedbackMessage: 'I did not catch that. Please speak or type a command.',
      affectedDeviceIds: [],
      pipelineStages: stages
    };
  }

  // STAGE 2: Wake-Word Verification & Addressing Check
  const requireWakeWord = options.requireWakeWord !== false;
  const wakeWordPresent = hasWakeWord(cleanedRaw);

  stages.push({
    step: 2,
    name: 'Wake-Word Verification & Addressing Check',
    description: 'Verifies addressing prerequisite: commands must address SOFIA by saying "Sofia" or "Hey Sofia"',
    input: cleanedRaw,
    output: wakeWordPresent 
      ? 'Wake word verified ("Sofia" / "Hey Sofia" detected). Command authorized.'
      : 'Wake word missing. Addressing requirement failed.',
    status: (!requireWakeWord || wakeWordPresent) ? 'success' : 'error',
    details: { 
      wakeWordPresent, 
      enforced: requireWakeWord, 
      requiredPrefix: 'Sofia or Hey Sofia' 
    }
  });

  if (requireWakeWord && !wakeWordPresent) {
    return {
      rawTranscript: cleanedRaw,
      preprocessedText: cleanedRaw,
      intent: 'UNKNOWN',
      wakeWordDetected: false,
      confidence: 0,
      validationSuccess: false,
      validationError: 'Start your command with Sofia.',
      feedbackMessage: 'Start your command with Sofia.',
      affectedDeviceIds: [],
      pipelineStages: stages
    };
  }

  // Extract command portion after wake word
  const commandText = extractCommandAfterWakeWord(cleanedRaw);

  if (!commandText) {
    // User only said "Sofia" or "Hey Sofia"
    return {
      rawTranscript: cleanedRaw,
      preprocessedText: '',
      intent: 'UNKNOWN',
      wakeWordDetected: true,
      confidence: 1.0,
      validationSuccess: false,
      validationError: 'Awaiting your command. Say an appliance instruction.',
      feedbackMessage: "Yes? I'm listening...",
      affectedDeviceIds: [],
      pipelineStages: stages
    };
  }

  // STAGE 3: Text Preprocessing & Normalization
  let preprocessed = commandText.toLowerCase();
  preprocessed = preprocessed.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, ' ');
  preprocessed = parseSpokenNumbers(preprocessed);
  preprocessed = preprocessed.replace(/\s+/g, ' ').trim();

  // Synonym mappings
  preprocessed = preprocessed
    .replace(/\bswitch on\b/g, 'turn on')
    .replace(/\bswitch off\b/g, 'turn off')
    .replace(/\bpower on\b/g, 'turn on')
    .replace(/\bpower off\b/g, 'turn off')
    .replace(/\bshut off\b/g, 'turn off')
    .replace(/\bair conditioner\b/g, 'ac')
    .replace(/\bair conditioning\b/g, 'ac')
    .replace(/\bair circulator\b/g, 'fan')
    .replace(/\bblinds\b/g, 'shades')
    .replace(/\bcurtain\b/g, 'curtains')
    .replace(/\btelevision\b/g, 'tv')
    .replace(/\bstove\b/g, 'cooktop')
    .replace(/\brange hood\b/g, 'exhaust fan')
    .replace(/\bkitchen fan\b/g, 'exhaust fan')
    .replace(/\bunder cabinet lights\b/g, 'counter lights')
    .replace(/\bunder-cabinet lights\b/g, 'counter lights')
    .replace(/\bunder cabinet light\b/g, 'counter lights')
    .replace(/\bunder cabinet lighting\b/g, 'counter lights')
    .replace(/\bcountertop lights\b/g, 'counter lights')
    .replace(/\bcountertop light\b/g, 'counter lights')
    .replace(/\brefrigerator\b/g, 'fridge')
    .replace(/\bfront door\b/g, 'entryway door')
    .replace(/\bdoor\b/g, 'entryway door');

  stages.push({
    step: 3,
    name: 'Text Preprocessing & Normalization',
    description: 'Case folding, punctuation stripping, synonym mapping, and tokenization',
    input: commandText,
    output: preprocessed,
    details: {
      tokens: preprocessed.split(' '),
      transformationsApplied: ['case-folding', 'punctuation-removal', 'synonym-mapping']
    },
    status: 'success'
  });

  // STAGE 4: Intent Classification
  let intent: IntentType = 'UNKNOWN';
  let confidence = 0.85;

  if (
    preprocessed.includes('turn off all devices') || 
    preprocessed.includes('all devices off') ||
    preprocessed.includes('turn off all kitchen appliances') ||
    preprocessed.includes('turn off all kitchen devices') ||
    preprocessed.includes('turn off all bedroom appliances') ||
    preprocessed.includes('all kitchen appliances off')
  ) {
    intent = 'ALL_DEVICES_OFF';
    confidence = 0.98;
  } else if (
    preprocessed.includes('turn on all lights') || 
    preprocessed.includes('switch on all lights') || 
    preprocessed.includes('all lights on') ||
    preprocessed.includes('turn on all bedroom lights') ||
    preprocessed.includes('turn on all kitchen lights')
  ) {
    intent = 'ALL_LIGHTS_ON';
    confidence = 0.98;
  } else if (
    preprocessed.includes('turn off all lights') || 
    preprocessed.includes('switch off all lights') || 
    preprocessed.includes('all lights off') ||
    preprocessed.includes('turn off all bedroom lights') ||
    preprocessed.includes('turn off all kitchen lights')
  ) {
    intent = 'ALL_LIGHTS_OFF';
    confidence = 0.98;
  } else if (preprocessed.includes('open') && (preprocessed.includes('shade') || preprocessed.includes('curtain'))) {
    intent = 'OPEN_SHADES';
    confidence = 0.95;
  } else if (preprocessed.includes('close') && (preprocessed.includes('shade') || preprocessed.includes('curtain'))) {
    intent = 'CLOSE_SHADES';
    confidence = 0.95;
  } else if (preprocessed.includes('unlock')) {
    intent = 'UNLOCK_ENTRY';
    confidence = 0.96;
  } else if (preprocessed.includes('lock')) {
    intent = 'LOCK_ENTRY';
    confidence = 0.96;
  } else if (preprocessed.includes('turn on')) {
    intent = 'TURN_ON';
    confidence = 0.92;
  } else if (preprocessed.includes('turn off')) {
    intent = 'TURN_OFF';
    confidence = 0.92;
  } else if (preprocessed.includes('set') && (preprocessed.includes('degree') || preprocessed.includes('temp') || preprocessed.includes('ac'))) {
    intent = 'SET_TEMPERATURE';
    confidence = 0.94;
  } else if (preprocessed.includes('set') || preprocessed.includes('dim') || preprocessed.includes('brighten')) {
    intent = 'SET_BRIGHTNESS';
    confidence = 0.88;
  } else if (preprocessed.includes('status') || preprocessed.includes('check')) {
    intent = 'QUERY_STATUS';
    confidence = 0.85;
  } else if (
    preprocessed.includes('movie night') ||
    preprocessed.includes('good morning') ||
    preprocessed.includes('study mode') ||
    preprocessed.includes('away mode') ||
    preprocessed.includes('good night') ||
    preprocessed.includes('preset') ||
    preprocessed.includes('scene')
  ) {
    intent = 'ACTIVATE_SCENE';
    confidence = 0.96;
  }

  stages.push({
    step: 4,
    name: 'Intent Classification',
    description: 'Rule-based intent inference engine matching semantics & grammatical patterns',
    input: preprocessed,
    output: intent,
    status: intent !== 'UNKNOWN' ? 'success' : 'warning',
    details: { intent, confidenceScore: confidence }
  });

  // STAGE 5: Slot & Entity Identification
  let targetRoom: RoomId | 'all' | undefined = undefined;
  let targetDeviceType: DeviceType | 'all' | undefined = undefined;
  let specificDeviceId: string | undefined = undefined;
  let extractedValue: number | undefined = undefined;
  let sceneName: string | undefined = undefined;

  if (intent === 'ACTIVATE_SCENE') {
    if (preprocessed.includes('movie night')) sceneName = 'Movie Night';
    else if (preprocessed.includes('good morning')) sceneName = 'Good Morning';
    else if (preprocessed.includes('study mode') || preprocessed.includes('study')) sceneName = 'Study Mode';
    else if (preprocessed.includes('away mode') || preprocessed.includes('away')) sceneName = 'Away Mode';
    else if (preprocessed.includes('good night') || preprocessed.includes('sleep mode')) sceneName = 'Good Night';
    else {
      const match = preprocessed.match(/(?:preset|scene)\s+([a-z0-9\s]+)/i) || preprocessed.match(/activate\s+([a-z0-9\s]+)/i);
      if (match && match[1]) {
        sceneName = match[1].trim();
      }
    }
  }

  // Room identification
  if (preprocessed.includes('living room')) targetRoom = 'living_room';
  else if (preprocessed.includes('bedroom')) targetRoom = 'bedroom';
  else if (preprocessed.includes('kitchen')) targetRoom = 'kitchen';
  else if (preprocessed.includes('office')) targetRoom = 'office';
  else if (preprocessed.includes('entryway') || preprocessed.includes('front door')) targetRoom = 'entryway';
  else if (preprocessed.includes('garden')) targetRoom = 'garden';

  // Device type & specific device identification
  if (preprocessed.includes('bedside lamp') || preprocessed.includes('bed lamp') || preprocessed.includes('nightstand')) {
    targetDeviceType = 'light';
    specificDeviceId = 'bedroom_bedside_lamp';
    targetRoom = 'bedroom';
  } else if (preprocessed.includes('counter light') || preprocessed.includes('counter lights') || preprocessed.includes('counter illumination')) {
    targetDeviceType = 'light';
    specificDeviceId = 'kitchen_counter_light';
    targetRoom = 'kitchen';
  } else if (preprocessed.includes('reading lamp')) {
    targetDeviceType = 'light';
    specificDeviceId = 'reading_lamp';
    targetRoom = 'living_room';
  } else if (preprocessed.includes('bedroom ceiling') || (targetRoom === 'bedroom' && preprocessed.includes('ceiling light'))) {
    targetDeviceType = 'light';
    specificDeviceId = 'bedroom_ceiling_light';
    targetRoom = 'bedroom';
  } else if (preprocessed.includes('kitchen ceiling') || (targetRoom === 'kitchen' && preprocessed.includes('ceiling light'))) {
    targetDeviceType = 'light';
    specificDeviceId = 'kitchen_light';
    targetRoom = 'kitchen';
  } else if (preprocessed.includes('main ceiling')) {
    targetDeviceType = 'light';
    specificDeviceId = 'living_room_main';
    targetRoom = 'living_room';
  } else if (preprocessed.includes('cooktop') || preprocessed.includes('induction')) {
    targetDeviceType = 'cooktop';
    specificDeviceId = 'kitchen_cooktop';
    targetRoom = 'kitchen';
  } else if (preprocessed.includes('fridge') || preprocessed.includes('refrigerator')) {
    targetDeviceType = 'refrigerator';
    specificDeviceId = 'kitchen_fridge';
    targetRoom = 'kitchen';
  } else if (preprocessed.includes('microwave')) {
    targetDeviceType = 'microwave';
    specificDeviceId = 'kitchen_microwave';
    targetRoom = 'kitchen';
  } else if (preprocessed.includes('exhaust fan') || preprocessed.includes('exhaust')) {
    targetDeviceType = 'fan';
    specificDeviceId = 'kitchen_exhaust_fan';
    targetRoom = 'kitchen';
  } else if (preprocessed.includes('curtains') || preprocessed.includes('curtain')) {
    targetDeviceType = 'shades';
    specificDeviceId = 'bedroom_curtains';
    targetRoom = 'bedroom';
  } else if (preprocessed.includes('lights') || preprocessed.includes('light') || preprocessed.includes('lamp') || preprocessed.includes('ceiling')) {
    targetDeviceType = 'light';
    if (targetRoom === 'bedroom' && !preprocessed.includes('all')) {
      if (preprocessed.includes('lamp')) specificDeviceId = 'bedroom_bedside_lamp';
      else specificDeviceId = 'bedroom_ceiling_light';
    } else if (targetRoom === 'kitchen' && !preprocessed.includes('all')) {
      if (preprocessed.includes('counter')) specificDeviceId = 'kitchen_counter_light';
      else specificDeviceId = 'kitchen_light';
    } else if (targetRoom === 'living_room' && !preprocessed.includes('all')) {
      if (preprocessed.includes('reading') || preprocessed.includes('lamp')) specificDeviceId = 'reading_lamp';
      else specificDeviceId = 'living_room_main';
    }
  } else if (preprocessed.includes('fan') || preprocessed.includes('circulator')) {
    targetDeviceType = 'fan';
    if (targetRoom === 'bedroom') specificDeviceId = 'bedroom_fan';
    else if (targetRoom === 'kitchen') specificDeviceId = 'kitchen_exhaust_fan';
    else if (targetRoom === 'living_room') specificDeviceId = 'living_room_fan';
  } else if (preprocessed.includes('ac') || preprocessed.includes('thermostat')) {
    targetDeviceType = 'ac';
    if (targetRoom === 'living_room') {
      specificDeviceId = 'living_room_ac';
    } else {
      specificDeviceId = 'bedroom_ac';
      if (!targetRoom) targetRoom = 'bedroom';
    }
  } else if (preprocessed.includes('tv')) {
    targetDeviceType = 'tv';
    specificDeviceId = 'living_room_tv';
    targetRoom = 'living_room';
  } else if (preprocessed.includes('shade') || preprocessed.includes('shades')) {
    targetDeviceType = 'shades';
    if (targetRoom === 'bedroom') specificDeviceId = 'bedroom_curtains';
    else if (targetRoom === 'living_room') specificDeviceId = 'living_room_shades';
  } else if (preprocessed.includes('sprinkler') || preprocessed.includes('sprinklers')) {
    targetDeviceType = 'sprinkler';
    targetRoom = 'garden';
  } else if (preprocessed.includes('lock') || preprocessed.includes('door')) {
    targetDeviceType = 'lock';
    targetRoom = 'entryway';
  }

  // Extract numerical values
  const numMatch = preprocessed.match(/\b(\d{1,3})\s*(?:degrees|degree|c|celsius|%|percent)?\b/);
  if (numMatch) {
    extractedValue = parseInt(numMatch[1], 10);
  }

  // Room-specific or global overrides
  if (intent === 'ALL_LIGHTS_ON' || intent === 'ALL_LIGHTS_OFF') {
    if (!targetRoom) targetRoom = 'all';
    targetDeviceType = 'light';
  } else if (intent === 'ALL_DEVICES_OFF') {
    if (!targetRoom) targetRoom = 'all';
    targetDeviceType = 'all';
  }

  stages.push({
    step: 5,
    name: 'Slot & Entity Identification',
    description: 'Extracted spatial targets, appliance categories, and numerical parameters',
    input: preprocessed,
    output: {
      room: targetRoom || 'unspecified',
      deviceType: targetDeviceType || 'unspecified',
      specificDeviceId: specificDeviceId || 'none',
      value: extractedValue !== undefined ? extractedValue : 'none'
    },
    status: (targetDeviceType || targetRoom) ? 'success' : 'warning',
    details: { targetRoom, targetDeviceType, specificDeviceId, extractedValue }
  });

  // STAGE 6: Command Validation
  let validationSuccess = true;
  let validationError: string | undefined = undefined;
  const affectedDeviceIds: string[] = [];

  if (intent === 'UNKNOWN') {
    validationSuccess = false;
    validationError = `Unrecognized command "${commandText}". Please repeat your command (e.g. "turn on bedroom light", "set AC to 22 degrees", "turn off all lights").`;
  } else if (intent === 'ALL_DEVICES_OFF') {
    if (targetRoom && targetRoom !== 'all') {
      const roomDevices = currentDevices.filter(d => d.room === targetRoom);
      affectedDeviceIds.push(...roomDevices.map(d => d.id));
    } else {
      affectedDeviceIds.push(...currentDevices.map(d => d.id));
    }
  } else if (intent === 'ALL_LIGHTS_ON' || intent === 'ALL_LIGHTS_OFF') {
    if (targetRoom && targetRoom !== 'all') {
      const roomLights = currentDevices.filter(d => d.type === 'light' && d.room === targetRoom);
      affectedDeviceIds.push(...roomLights.map(d => d.id));
    } else {
      affectedDeviceIds.push(...currentDevices.filter(d => d.type === 'light').map(d => d.id));
    }
  } else if (intent === 'SET_TEMPERATURE') {
    if (extractedValue === undefined) {
      validationSuccess = false;
      validationError = 'Target temperature missing in speech command (e.g. "Sofia, set the bedroom AC to 22 degrees").';
    } else if (extractedValue < 16 || extractedValue > 30) {
      validationSuccess = false;
      validationError = `Requested temperature (${extractedValue}°C) is outside safe climate range [16°C - 30°C].`;
    } else {
      let acDevices = currentDevices.filter(d => d.type === 'ac' && (!targetRoom || d.room === targetRoom));
      if (acDevices.length === 0) {
        // Fallback to any AC device available in the house
        acDevices = currentDevices.filter(d => d.type === 'ac');
      }
      if (acDevices.length === 0) {
        validationSuccess = false;
        validationError = `No AC unit found in ${targetRoom || 'home'}.`;
      } else {
        affectedDeviceIds.push(...acDevices.map(d => d.id));
      }
    }
  } else if (intent === 'ACTIVATE_SCENE') {
    validationSuccess = true;
    if (sceneName === 'Movie Night') {
      affectedDeviceIds.push('living_room_tv', 'living_room_main', 'living_room_shades');
    } else if (sceneName === 'Good Morning') {
      affectedDeviceIds.push('living_room_main', 'bedroom_curtains', 'bedroom_ac', 'kitchen_light');
    } else if (sceneName === 'Study Mode') {
      affectedDeviceIds.push('office_lights', 'reading_lamp', 'living_room_fan');
    } else if (sceneName === 'Away Mode') {
      affectedDeviceIds.push('front_door_lock', 'living_room_main', 'bedroom_ceiling_light', 'kitchen_light');
    } else if (sceneName === 'Good Night') {
      affectedDeviceIds.push('front_door_lock', 'bedroom_bedside_lamp', 'bedroom_ac');
    } else {
      affectedDeviceIds.push(...currentDevices.slice(0, 4).map(d => d.id));
    }
  } else {
    // Targeted command
    let matching = currentDevices.filter(d => {
      if (specificDeviceId && d.id === specificDeviceId) return true;
      if (targetRoom && targetRoom !== 'all' && d.room !== targetRoom) return false;
      if (targetDeviceType && targetDeviceType !== 'all' && d.type !== targetDeviceType) return false;
      return true;
    });

    if (matching.length === 0 && specificDeviceId) {
      const direct = currentDevices.find(d => d.id === specificDeviceId);
      if (direct) matching = [direct];
    }

    if (matching.length === 0 && targetDeviceType) {
      matching = currentDevices.filter(d => d.type === targetDeviceType && (!targetRoom || targetRoom === 'all' || d.room === targetRoom));
    }

    if (matching.length === 0) {
      validationSuccess = false;
      validationError = `Could not resolve device for room="${targetRoom || 'any'}" and type="${targetDeviceType || 'unknown'}".`;
    } else {
      affectedDeviceIds.push(...matching.map(d => d.id));
    }
  }

  stages.push({
    step: 6,
    name: 'Command Validation & Semantic Check',
    description: 'Verified device registry compatibility, range boundaries, and presence',
    input: { intent, targetRoom, targetDeviceType, affectedCandidateCount: affectedDeviceIds.length },
    output: validationSuccess ? `Valid command. Targeting ${affectedDeviceIds.length} device(s).` : validationError,
    status: validationSuccess ? 'success' : 'error',
    details: { validated: validationSuccess, affectedCount: affectedDeviceIds.length, error: validationError }
  });

  // STAGE 7: Simulated Appliance Control Plan
  stages.push({
    step: 7,
    name: 'Simulated Appliance Control Plan',
    description: 'Hardware instruction abstraction dispatched to device state store',
    input: affectedDeviceIds,
    output: validationSuccess ? `State updates queued for [${affectedDeviceIds.join(', ')}]` : 'Dispatched no hardware changes (validation failed)',
    status: validationSuccess ? 'success' : 'warning',
    details: { affectedDeviceIds, statePayload: { intent, extractedValue } }
  });

  // STAGE 8: Feedback & Activity Logging
  let feedbackMessage = '';
  if (!validationSuccess) {
    feedbackMessage = validationError || 'Unable to execute command.';
  } else {
    switch (intent) {
      case 'ALL_LIGHTS_ON':
        feedbackMessage = targetRoom && targetRoom !== 'all'
          ? `All ${targetRoom.replace('_', ' ')} lights turned on.`
          : 'All lights turned on.';
        break;
      case 'ALL_LIGHTS_OFF':
        feedbackMessage = targetRoom && targetRoom !== 'all'
          ? `All ${targetRoom.replace('_', ' ')} lights turned off.`
          : 'All lights turned off.';
        break;
      case 'ALL_DEVICES_OFF':
        feedbackMessage = targetRoom && targetRoom !== 'all'
          ? `All ${targetRoom.replace('_', ' ')} appliances turned off.`
          : 'All devices turned off.';
        break;
      case 'SET_TEMPERATURE':
        if (targetRoom === 'living_room' || specificDeviceId === 'living_room_ac') {
          feedbackMessage = `Living room AC set to ${extractedValue}°C.`;
        } else {
          feedbackMessage = `Bedroom AC set to ${extractedValue}°C.`;
        }
        break;
      case 'OPEN_SHADES':
        feedbackMessage = targetRoom === 'bedroom' || specificDeviceId === 'bedroom_curtains'
          ? 'Bedroom curtains opened.'
          : 'Window shades opened.';
        break;
      case 'CLOSE_SHADES':
        feedbackMessage = targetRoom === 'bedroom' || specificDeviceId === 'bedroom_curtains'
          ? 'Bedroom curtains closed.'
          : 'Window shades closed.';
        break;
      case 'UNLOCK_ENTRY':
        feedbackMessage = 'Front door unlocked.';
        break;
      case 'LOCK_ENTRY':
        feedbackMessage = 'Front door locked and secured.';
        break;
      case 'TURN_ON':
        if (specificDeviceId === 'bedroom_ceiling_light' || (targetRoom === 'bedroom' && targetDeviceType === 'light')) {
          feedbackMessage = 'Bedroom light turned on successfully.';
        } else if (specificDeviceId === 'bedroom_bedside_lamp') {
          feedbackMessage = 'Bedroom bedside lamp turned on.';
        } else if (specificDeviceId === 'kitchen_counter_light') {
          feedbackMessage = 'Kitchen counter lights turned on.';
        } else if (specificDeviceId === 'kitchen_exhaust_fan') {
          feedbackMessage = 'Kitchen exhaust fan turned on.';
        } else if (specificDeviceId === 'kitchen_cooktop') {
          feedbackMessage = 'Kitchen cooktop turned on.';
        } else if (specificDeviceId === 'kitchen_fridge') {
          feedbackMessage = 'Smart refrigerator activated.';
        } else if (specificDeviceId === 'kitchen_microwave') {
          feedbackMessage = 'Kitchen microwave powered on.';
        } else if (targetDeviceType === 'light') {
          feedbackMessage = targetRoom === 'living_room' 
            ? 'Living room lights turned on.' 
            : targetRoom === 'kitchen' 
            ? 'Kitchen lights turned on.' 
            : targetRoom === 'bedroom'
            ? 'Bedroom light turned on successfully.'
            : 'Lights turned on.';
        } else if (targetDeviceType === 'fan') {
          feedbackMessage = targetRoom === 'bedroom' 
            ? 'Bedroom fan turned on.' 
            : targetRoom === 'kitchen'
            ? 'Kitchen exhaust fan turned on.'
            : 'Air circulator turned on.';
        } else if (targetDeviceType === 'tv') {
          feedbackMessage = 'Television powered on.';
        } else if (targetDeviceType === 'shades') {
          feedbackMessage = targetRoom === 'bedroom' ? 'Bedroom curtains opened.' : 'Window shades opened.';
        } else {
          feedbackMessage = `${targetRoom ? targetRoom.replace('_', ' ') : 'Appliance'} turned on.`;
        }
        break;
      case 'TURN_OFF':
        if (specificDeviceId === 'bedroom_ceiling_light' || (targetRoom === 'bedroom' && targetDeviceType === 'light')) {
          feedbackMessage = 'Bedroom light turned off.';
        } else if (specificDeviceId === 'bedroom_bedside_lamp') {
          feedbackMessage = 'Bedroom bedside lamp turned off.';
        } else if (specificDeviceId === 'kitchen_counter_light') {
          feedbackMessage = 'Kitchen counter lights turned off.';
        } else if (specificDeviceId === 'kitchen_exhaust_fan') {
          feedbackMessage = 'Kitchen exhaust fan turned off.';
        } else if (specificDeviceId === 'kitchen_cooktop') {
          feedbackMessage = 'Kitchen cooktop turned off.';
        } else if (specificDeviceId === 'kitchen_fridge') {
          feedbackMessage = 'Smart refrigerator set to standby.';
        } else if (specificDeviceId === 'kitchen_microwave') {
          feedbackMessage = 'Kitchen microwave turned off.';
        } else if (targetDeviceType === 'light') {
          feedbackMessage = targetRoom === 'living_room' 
            ? 'Living room lights turned off.' 
            : targetRoom === 'kitchen'
            ? 'Kitchen lights turned off.'
            : targetRoom === 'bedroom'
            ? 'Bedroom lights turned off.'
            : 'Lights turned off.';
        } else if (targetDeviceType === 'fan') {
          feedbackMessage = targetRoom === 'bedroom' 
            ? 'Bedroom fan turned off.' 
            : targetRoom === 'kitchen'
            ? 'Kitchen exhaust fan turned off.'
            : 'Air circulator turned off.';
        } else if (targetDeviceType === 'tv') {
          feedbackMessage = 'Television powered off.';
        } else if (targetDeviceType === 'shades') {
          feedbackMessage = targetRoom === 'bedroom' ? 'Bedroom curtains closed.' : 'Window shades closed.';
        } else {
          feedbackMessage = `${targetRoom ? targetRoom.replace('_', ' ') : 'Appliance'} turned off.`;
        }
        break;
      case 'ACTIVATE_SCENE':
        feedbackMessage = sceneName 
          ? `Activated "${sceneName}" preset scene.`
          : 'Automation preset scene applied.';
        break;
      default:
        feedbackMessage = `Command executed successfully.`;
        break;
    }
  }

  stages.push({
    step: 8,
    name: 'Feedback & Activity Logging',
    description: 'User notification synthesized and logged to Recent Activity audit trail',
    input: { feedbackMessage, validationSuccess },
    output: feedbackMessage,
    status: validationSuccess ? 'success' : 'error',
    details: { feedback: feedbackMessage, loggedTimestamp: new Date().toISOString() }
  });

  return {
    rawTranscript: cleanedRaw,
    preprocessedText: preprocessed,
    intent,
    wakeWordDetected: true,
    targetRoom,
    targetDeviceType,
    specificDeviceId,
    extractedValue,
    sceneName,
    confidence,
    validationSuccess,
    validationError,
    feedbackMessage,
    affectedDeviceIds,
    pipelineStages: stages
  };
}
