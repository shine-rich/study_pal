const form = document.getElementById('form');
const input = document.getElementById('message');
const messages = document.getElementById('messages');
const loader = document.getElementById('loader');

var foundVoice = null;
const femaleVoices = [
  'Female',
  'Susan',
  'Moira',
  'Tessa',
  'Karen',
  'Mei-Ja',
  'Tian-Tian',
  'Kyoko',
  'Zira'
];
window.speechSynthesis.onvoiceschanged = () => { 
  console.warn('voices are ready', window.speechSynthesis.getVoices()); 
  foundVoice = speechSynthesis.getVoices()
    .find(({ name }) => includesAnySubstring(name, femaleVoices));
  console.log("foundVoice,", foundVoice);
};

/* Handle async loader things */
const modules = [];

window.LOADED = (thing) => {
  modules.push(thing);
  if (modules.length === 2) loader.style.display = 'none';
}

/* begin */
const createMessage = (sender, message) => {
  const div = document.createElement('div');

  div.className = sender;
  div.innerText = message;

  messages.append(div);
  div.scrollIntoView();
}

const includesAnySubstring = (string, array) => {
  return array.some(substring => string.includes(substring));
}

const speak_message = (botResponse) => {  
    // Use speech synthesis to speak the bot's response
    if ("speechSynthesis" in window || speechSynthesis) {
      const T2S = window.speechSynthesis || speechSynthesis;
      const utter = new SpeechSynthesisUtterance(botResponse);
      if (foundVoice) utter.voice = foundVoice;

      var mouthValue = 0;
      window.APP.ticker.add(() => {
        // mimic the interpolation value, 0-1
        mouthValue = Math.sin(performance.now() / 200) / 2 + 0.5;
      });

      const updateFn = window.MODEL.internalModel.motionManager.update;
      window.MODEL.internalModel.motionManager.update = () => {
        updateFn.call(window.MODEL.internalModel.motionManager);
        // overwrite the parameter after calling original update function
        window.MODEL.internalModel.coreModel.setParamFloat('PARAM_MOUTH_OPEN_Y', mouthValue);
      };

      // Start mouth movement when speaking starts
      utter.onstart = () => { window.APP.ticker.start() };

      // Stop mouth movement after speaking
      const clear = () => { window.APP.ticker.stop() };
      utter.onerror = clear;
      utter.onend = clear;

      T2S.speak(utter); // Speak the utterance

      // Stop speaking if the page is closed
      window.onbeforeunload = function () {
        T2S.cancel();
      };
    }
}

// Add a reference to the toggle switch
const apiToggle = document.getElementById('api-toggle-switch');

// Initialize should_use_api based on the toggle state
let should_use_api = apiToggle.checked;

// Listen for toggle changes
apiToggle.addEventListener('change', () => {
  should_use_api = apiToggle.checked;
  console.log(`API mode: ${should_use_api ? 'ON' : 'OFF'}`);
});

const processMessage = async (message) => {
  // random delay for "authenticity"
  const delay = Math.random() * 2000 + 300;

  // Add a loading indicator
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'chiai loading-indicator';
  loadingDiv.innerText = 'Thinking';
  messages.append(loadingDiv);
  loadingDiv.scrollIntoView();

  try {
    if (should_use_api) {
      const timeout = 30000; // 30 seconds
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), timeout);
      });

      // Send the user's input to the FastAPI server  
      const response = await Promise.race([
        fetch('http://chat.santostar.com:8001/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_input: message }),
        }),
        timeoutPromise,
      ]);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      const botResponse = data.response;

      // Remove the loading indicator
      messages.removeChild(loadingDiv);

      // Display the bot's response in the chat
      setTimeout(() => createMessage('chiai', botResponse), delay);
      speak_message(botResponse);
    } else {
      NLP
      .process(message).then((e) => {
        const answer = e.answer || "Sorry, I don't speak that language";

        // Remove the loading indicator
        messages.removeChild(loadingDiv);

        setTimeout(() => createMessage('chiai', answer), delay)
        speak_message(answer);
      });
    }
  } catch (error) {
    // Remove the loading indicator on error
    messages.removeChild(loadingDiv);
    console.error('Error:', error);
    setTimeout(() => createMessage('chiai', "Sorry, I couldn't process your request."), delay);
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const message = input.value.trim();

  if (!message.length) return;

  createMessage('me', message);
  processMessage(message);

  input.value = '';
});