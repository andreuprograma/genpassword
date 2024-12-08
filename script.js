// script.js

const CHARSET = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

function toggleSeedWordVisibility() {
  const seedInput = document.getElementById('seedWord');
  const toggle = document.getElementById('toggleSeedWord');
  seedInput.type = toggle.checked ? 'text' : 'password';
}

function enforceLowercase(input) {
  input.value = input.value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function getSelectedCharsets() {
  const selectedCharsets = {};
  if (document.getElementById('uppercase').checked) selectedCharsets.uppercase = CHARSET.uppercase;
  if (document.getElementById('lowercase').checked) selectedCharsets.lowercase = CHARSET.lowercase;
  if (document.getElementById('numbers').checked) selectedCharsets.numbers = CHARSET.numbers;
  if (document.getElementById('symbols').checked) selectedCharsets.symbols = CHARSET.symbols;
  return selectedCharsets;
}

function generatePassword() {
  const seedWord = document.getElementById('seedWord').value;
  const baseWord = document.getElementById('baseWord').value;
  const passwordLength = parseInt(document.getElementById('passwordLength').value);
  
  if (!seedWord || !baseWord) {
    alert('Por favor ingresa tanto la palabra semilla como la palabra base');
    return;
  }

  const selectedCharsets = getSelectedCharsets();
  if (Object.keys(selectedCharsets).length === 0) {
    alert('Por favor selecciona al menos un tipo de carácter');
    return;
  }

  const combinedInput = seedWord + baseWord;
  const hash = CryptoJS.SHA256(combinedInput).toString();

  let password = generateDeterministicPassword(hash, selectedCharsets, passwordLength);
  document.getElementById('passwordDisplay').textContent = password;
  
  updateStrengthMeter(password);
}

function generateDeterministicPassword(hash, selectedCharsets, length) {
  let password = '';
  const hashNumbers = hash.split('').map(c => parseInt(c, 16));
  const charsetKeys = Object.keys(selectedCharsets);
  
  const minLength = Math.min(length, charsetKeys.length);
  for(let i = 0; i < minLength; i++) {
    const charset = selectedCharsets[charsetKeys[i]];
    password += charset[hashNumbers[i] % charset.length];
  }

  while (password.length < length) {
    const index = password.length;
    const charsetIndex = hashNumbers[index % hashNumbers.length] % charsetKeys.length;
    const charset = selectedCharsets[charsetKeys[charsetIndex]];
    const charIndex = hashNumbers[(index + 1) % hashNumbers.length] % charset.length;
    password += charset[charIndex];
  }

  return shufflePassword(password, hashNumbers);
}

function shufflePassword(password, hashNumbers) {
  const array = password.split('');
  for (let i = array.length - 1; i > 0; i--) {
    const j = hashNumbers[i % hashNumbers.length] % (i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array.join('');
}

function updateStrengthMeter(password) {
  let strength = 0;
  
  if (password.length >= 8) strength += 25;
  if (password.match(/[A-Z]/)) strength += 25;
  if (password.match(/[0-9]/)) strength += 25;
  if (password.match(/[^A-Za-z0-9]/)) strength += 25;

  const meter = document.getElementById('strengthMeter');
  meter.style.width = strength + '%';
  
  if (strength <= 25) {
    meter.style.background = '#ff4444';
  } else if (strength <= 50) {
    meter.style.background = '#ffbb33';
  } else if (strength <= 75) {
    meter.style.background = '#00C851';
  } else {
    meter.style.background = '#007E33';
  }
}

function copyPassword() {
  const passwordDisplay = document.getElementById('passwordDisplay');
  const password = passwordDisplay.textContent;
  
  navigator.clipboard.writeText(password).then(() => {
    alert('Contraseña copiada al portapapeles');
  }).catch(err => {
    console.error('Error al copiar la contraseña: ', err);
  });
}

document.getElementById('baseWord').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    document.getElementById('generateBtn').click();
  }
});
document.getElementById('seedWord').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    document.getElementById('generateBtn').click();
  }
});
