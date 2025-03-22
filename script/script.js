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

// Add references to the therapist overlay and close button
const therapistOverlay = document.getElementById('therapist-overlay');
const closeTherapistOverlayButton = document.getElementById('close-therapist-overlay');
const therapistList = document.getElementById('therapist-list');

// Function to show the therapist overlay
function showTherapistOverlay() {
  // Hardcoded therapist data (replace with dynamic data if needed)
  const therapists = [
    {
      name: "Tamara Denise Pena",
      link: "https://example.com/tamara",
      picture: "https://via.placeholder.com/60" // Replace with actual image URL
    },
    {
      name: "Maria da Silva",
      link: "https://example.com/maria",
      picture: "https://via.placeholder.com/60" // Replace with actual image URL
    },
    {
      name: "Bryan Blakeny",
      link: "https://example.com/bryan",
      picture: "https://via.placeholder.com/60" // Replace with actual image URL
    },
    {
      name: "Jaleesia Rosemond",
      link: "https://example.com/jaleesia",
      picture: "https://via.placeholder.com/60" // Replace with actual image URL
    }
  ];

  // Clear existing list
  therapistList.innerHTML = '';

  // Populate the therapist list with pictures
  therapists.forEach(therapist => {
    const listItem = document.createElement('li');
    listItem.innerHTML = `
      <img src="${therapist.picture}" alt="${therapist.name}">
      <div>
        <a href="${therapist.link}" target="_blank">${therapist.name}</a>
      </div>
    `;
    therapistList.appendChild(listItem);
  });

  // Show the overlay
  therapistOverlay.style.display = 'flex';
}

// Function to hide the therapist overlay
function hideTherapistOverlay() {
  therapistOverlay.style.display = 'none';
}

// Close the overlay when the close button is clicked
closeTherapistOverlayButton.addEventListener('click', hideTherapistOverlay);

// Add references to the escalation overlay and close button
const escalationOverlay = document.getElementById('escalation-overlay');
const closeEscalationOverlayButton = document.getElementById('close-escalation-overlay');
const hotlineList = document.getElementById('hotline-list');

// Function to show the escalation overlay
function showEscalationOverlay() {
  // Hardcoded counselor and local hotline data (replace with dynamic data if needed)
  const counselor = {
    name: "Dr. Jane Doe",
    phone: "+1 (234) 567-890",
    email: "jane.doe@example.com"
  };

  const localHotlines = [
    { name: "Houston Crisis Hotline", number: "713-468-5463", link: "tel:713-468-5463" },
    { name: "Local Mental Health Support", number: "832-393-6630", link: "tel:832-393-6630" },
    { name: "Houston Emergency Services", number: "911", link: "tel:911" }
  ];

  // Clear existing list
  hotlineList.innerHTML = '';

  // Populate the local hotline list
  localHotlines.forEach(hotline => {
    const listItem = document.createElement('li');
    listItem.innerHTML = `
      <strong>${hotline.name}</strong><br>
      <a href="${hotline.link}" target="_blank">${hotline.number}</a>
    `;
    hotlineList.appendChild(listItem);
  });

  // Show the overlay
  escalationOverlay.style.display = 'flex';
}

// Function to hide the escalation overlay
function hideEscalationOverlay() {
  escalationOverlay.style.display = 'none';
}

// Close the overlay when the close button is clicked
closeEscalationOverlayButton.addEventListener('click', hideEscalationOverlay);

// Add references to the goals overlay and close button
const goalsOverlay = document.getElementById('goals-overlay');
const closeGoalsOverlayButton = document.getElementById('close-goals-overlay');
const goalsList = document.getElementById('goals-list');
const copingStrategiesList = document.getElementById('coping-strategies-list');

// Function to show the goals overlay
function showGoalsOverlay() {
  // Hardcoded treatment plan data (replace with dynamic data if needed)
  const treatmentPlan = {
    goals: ["Practice mindfulness daily", "Break tasks into smaller steps"],
    copingStrategies: ["Progressive muscle relaxation", "Listen to calming music", "Journal for 10 minutes"]
  };

  // Clear existing lists
  goalsList.innerHTML = '';
  copingStrategiesList.innerHTML = '';

  // Populate the goals list
  treatmentPlan.goals.forEach(goal => {
    const listItem = document.createElement('li');
    listItem.textContent = goal;
    goalsList.appendChild(listItem);
  });

  // Populate the coping strategies list
  treatmentPlan.copingStrategies.forEach(strategy => {
    const listItem = document.createElement('li');
    listItem.textContent = strategy;
    copingStrategiesList.appendChild(listItem);
  });

  // Show the overlay
  goalsOverlay.style.display = 'flex';
}

// Function to hide the goals overlay
function hideGoalsOverlay() {
  goalsOverlay.style.display = 'none';
}

// Close the overlay when the close button is clicked
closeGoalsOverlayButton.addEventListener('click', hideGoalsOverlay);

const processMessage = async (message) => {
  // random delay for "authenticity"
  const delay = Math.random() + 300;

  // Check for predefined commands
  // Check for the "show escalation" command
  if (message.toLowerCase().includes("show escalation")) {
    showEscalationOverlay();
    return; // Exit the function to prevent further processing
  } else if (message.toLowerCase().includes("show therapists")) {
    // Check for the "show therapists" command
    showTherapistOverlay();
    return; // Exit the function to prevent further processing
  } else if (message.toLowerCase().includes("show goals")) {
    // Check for the "show goals" command
    showGoalsOverlay();
    return; // Exit the function to prevent further processing
  }

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
          body: JSON.stringify({
            user_input: message,
            user_id: 'tGcsMce6an1Hl4GtW0lQOQiOMyCFGD3v' // Include the user_id
          }),
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