// Get contact info from URL
const urlParams = new URLSearchParams(window.location.search);
const contactName = urlParams.get('name');
const contactAvatar = urlParams.get('avatar');

const chatAvatar = document.getElementById('chatAvatar');
const chatName = document.getElementById('chatName');
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');

chatAvatar.src = contactAvatar;
chatName.textContent = contactName;

function addMessage(text, type){
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', type);
  const now = new Date();
  const hours = now.getHours()%12||12;
  const minutes = now.getMinutes().toString().padStart(2,'0');
  const ampm = now.getHours()>=12?'PM':'AM';
  const timeSpan = document.createElement('span');
  timeSpan.classList.add('message-time');
  timeSpan.textContent = `${hours}:${minutes} ${ampm}`;
  msgDiv.textContent = text;
  msgDiv.appendChild(timeSpan);
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Example initial messages
addMessage('Hey! How are you?', 'received');
addMessage('I am good, thanks!', 'sent');

sendBtn.addEventListener('click', ()=>{
  const msg = messageInput.value.trim();
  if(msg!==''){
    addMessage(msg,'sent');
    messageInput.value='';
    setTimeout(()=>addMessage('Automated reply','received'),1000);
  }
});

messageInput.addEventListener('keydown', e=>{
  if(e.key==='Enter') sendBtn.click();
});
