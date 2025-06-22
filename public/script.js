// --- AUTH & SESSION LOGIC ---
function getUsers() {
  return JSON.parse(localStorage.getItem('users') || '[]');
}
function setUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}
function setSession(email) {
  localStorage.setItem('session', email);
}
function getSession() {
  return localStorage.getItem('session');
}
function clearSession() {
  localStorage.removeItem('session');
}

// LOGIN
if (document.getElementById('loginForm')) {
  document.getElementById('loginForm').onsubmit = function (e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setSession(email);
      // Also set userProfile for profile page
      localStorage.setItem('userProfile', JSON.stringify({ 
        name: user.name, 
        email: user.email, 
        summary: user.summary || 'No health summary yet.',
        phone: user.phone || '',
        dob: user.dob || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        postal: user.postal || '',
        emergency: user.emergency || '',
        image: user.image || ''
      }));
      window.location.href = 'dashboard.html';
    } else {
      document.getElementById('loginError').textContent = 'Invalid email or password.';
    }
  };
}

// SIGNUP
if (document.getElementById('signupForm')) {
  document.getElementById('signupForm').onsubmit = function (e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    let users = getUsers();
    if (users.find(u => u.email === email)) {
      document.getElementById('signupError').textContent = 'Email already registered.';
      return;
    }
    const user = { name, email, password, summary: 'No health summary yet.' };
    users.push(user);
    setUsers(users);
    setSession(email);
    localStorage.setItem('userProfile', JSON.stringify({ name, email, summary: 'No health summary yet.' }));
    window.location.href = 'dashboard.html';
  };
}

// DASHBOARD
if (document.getElementById('welcomeMsg')) {
  const session = getSession();
  if (!session) {
    window.location.href = 'login.html';
  } else {
    const users = getUsers();
    const user = users.find(u => u.email === session);
    document.getElementById('welcomeMsg').textContent = user ? `Welcome, ${user.name}!` : 'Welcome!';
    
    // Load recent cases
    const recentCases = document.getElementById('recentCases');
    if (recentCases) {
      const cases = JSON.parse(localStorage.getItem('cases') || '[]');
      if (cases.length > 0) {
        const recent = cases.slice(-3).reverse();
        recentCases.innerHTML = recent.map(c => 
          `<div style="padding:0.5rem;border-bottom:1px solid #eee;">
            <strong>${c.symptoms.join(', ')}</strong><br>
            <small>${c.date}</small>
          </div>`
        ).join('');
      } else {
        recentCases.innerHTML = 'No recent cases';
      }
    }
    
    // Load upcoming appointments
    const upcomingAppointments = document.getElementById('upcomingAppointments');
    if (upcomingAppointments) {
      const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      const upcoming = appointments.filter(a => new Date(a.date + ' ' + a.time) > new Date()).slice(0, 3);
      if (upcoming.length > 0) {
        upcomingAppointments.innerHTML = upcoming.map(a => 
          `<div style="padding:0.5rem;border-bottom:1px solid #eee;">
            <strong>${a.type}</strong><br>
            <small>${a.date} at ${a.time}</small>
          </div>`
        ).join('');
      } else {
        upcomingAppointments.innerHTML = 'No upcoming appointments';
      }
    }
  }
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.onclick = function () {
      clearSession();
      window.location.href = 'login.html';
    };
  }
}

// PROTECT PAGES (profile, form, cases, contact, result, calendar)
const protectedPages = ['profile.html', 'form.html', 'form-step2.html', 'form-step3.html', 'cases.html', 'contact.html', 'result.html', 'calendar.html'];
if (protectedPages.some(p => window.location.pathname.endsWith(p))) {
  if (!getSession()) {
    window.location.href = 'login.html';
  }
}

// --- ENHANCED PROFILE FUNCTIONALITY ---
if (document.getElementById('profileForm')) {
  // Load existing profile data
  let userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
  const session = getSession();
  const users = getUsers();
  const user = users.find(u => u.email === session);
  
  if (user) {
    // Populate form fields
    document.getElementById('profileName').value = user.name || '';
    document.getElementById('profileEmail').value = user.email || '';
    document.getElementById('profilePhone').value = user.phone || '';
    document.getElementById('profileDOB').value = user.dob || '';
    document.getElementById('profileAddress').value = user.address || '';
    document.getElementById('profileCity').value = user.city || '';
    document.getElementById('profileState').value = user.state || '';
    document.getElementById('profilePostal').value = user.postal || '';
    document.getElementById('profileEmergency').value = user.emergency || '';
    document.getElementById('profileSummary').value = user.summary || '';
    
    // Load profile image
    if (user.image) {
      document.getElementById('profileImage').src = user.image;
    }
  }
  
  // Handle image upload
  const imageUpload = document.getElementById('imageUpload');
  if (imageUpload) {
    imageUpload.onchange = function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          document.getElementById('profileImage').src = e.target.result;
          // Store image data
          localStorage.setItem('profileImage', e.target.result);
        };
        reader.readAsDataURL(file);
      }
    };
  }
  
  // Handle form submission
  document.getElementById('profileForm').onsubmit = function(e) {
    e.preventDefault();
    
    const profileData = {
      name: document.getElementById('profileName').value,
      email: document.getElementById('profileEmail').value,
      phone: document.getElementById('profilePhone').value,
      dob: document.getElementById('profileDOB').value,
      address: document.getElementById('profileAddress').value,
      city: document.getElementById('profileCity').value,
      state: document.getElementById('profileState').value,
      postal: document.getElementById('profilePostal').value,
      emergency: document.getElementById('profileEmergency').value,
      summary: document.getElementById('profileSummary').value,
      image: document.getElementById('profileImage').src
    };
    
    // Update user in users array
    let users = getUsers();
    users = users.map(u => {
      if (u.email === session) {
        return { ...u, ...profileData };
      }
      return u;
    });
    setUsers(users);
    
    // Update userProfile in localStorage
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    
    alert('Profile updated successfully!');
  };
  
  // Cancel button
  const cancelBtn = document.getElementById('cancelBtn');
  if (cancelBtn) {
    cancelBtn.onclick = function() {
      window.location.href = 'dashboard.html';
    };
  }
}

// --- MULTI-STEP SYMPTOM CHECK ---
document.addEventListener('DOMContentLoaded', function () {
  // STEP 1: Current Symptoms
  const symptomForm = document.getElementById('symptomForm');
  if (symptomForm) {
    symptomForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const checked = Array.from(document.querySelectorAll('input[name="symptom"]:checked')).map(cb => cb.value);
      localStorage.setItem('step1Symptoms', JSON.stringify(checked));
      window.location.href = 'form-step2.html';
    });
  }

  // STEP 2: Past Injuries
  const injuryForm = document.getElementById('injuryForm');
  if (injuryForm) {
    // Back button
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
      backBtn.onclick = function() {
        window.location.href = 'form.html';
      };
    }
    
    injuryForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const checked = Array.from(document.querySelectorAll('input[name="injury"]:checked')).map(cb => cb.value);
      localStorage.setItem('step2Injuries', JSON.stringify(checked));
      window.location.href = 'form-step3.html';
    });
  }

  // STEP 3: Additional Questions
  const questionForm = document.getElementById('questionForm');
  if (questionForm) {
    // Back button
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
      backBtn.onclick = function() {
        window.location.href = 'form-step2.html';
      };
    }
    
    questionForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const formData = new FormData(questionForm);
      const questions = {
        duration: formData.get('duration'),
        severity: formData.get('severity'),
        medications: formData.get('medications'),
        similar: formData.get('similar'),
        notes: formData.get('notes')
      };
      
      // Combine all steps and create case
      const symptoms = JSON.parse(localStorage.getItem('step1Symptoms') || '[]');
      const injuries = JSON.parse(localStorage.getItem('step2Injuries') || '[]');
      
      const caseData = {
        symptoms: symptoms,
        injuries: injuries,
        questions: questions,
        date: new Date().toLocaleString(),
        status: 'Under Review',
        progress: 25
      };
      
      // Save case
      const cases = JSON.parse(localStorage.getItem('cases') || '[]');
      cases.push(caseData);
      localStorage.setItem('cases', JSON.stringify(cases));
      
      // Clear step data
      localStorage.removeItem('step1Symptoms');
      localStorage.removeItem('step2Injuries');
      
      // Redirect to result
      window.location.href = 'result.html';
    });
  }

  // CASES PAGE - Show real logged cases
  const casesList = document.getElementById('casesList');
  if (casesList) {
    // Add logout functionality for cases page
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.onclick = function () {
        clearSession();
        window.location.href = 'login.html';
      };
    }
    
    // Load and display cases
    let cases = JSON.parse(localStorage.getItem('cases') || '[]');
    if (cases.length === 0) {
      casesList.innerHTML = '<p style="text-align:center;color:#666;padding:2rem;">No cases logged yet. Start a symptom check to create your first case.</p>';
    } else {
      casesList.innerHTML = '';
      cases.forEach((c, i) => {
        const card = document.createElement('div');
        card.className = 'case-card';
        card.innerHTML = `
          <div><strong>Symptoms:</strong> ${c.symptoms.join(', ') || 'None'}</div>
          <div><strong>Injuries:</strong> ${c.injuries.join(', ') || 'None'}</div>
          <div><strong>Severity:</strong> ${c.questions?.severity || 'Not specified'}</div>
          <div><strong>Duration:</strong> ${c.questions?.duration || 'Not specified'}</div>
          <div><strong>Date:</strong> ${c.date}</div>
          <div class="case-status"><strong>Status:</strong> ${c.status}</div>
          <div class="progress-bar"><div class="progress" style="width:0%"></div></div>
        `;
        casesList.appendChild(card);
        setTimeout(() => {
          card.querySelector('.progress').style.width = c.progress + '%';
        }, 100);
      });
    }
  }

  // CHAT FUNCTIONALITY
  if (document.getElementById('chatMessages')) {
    let currentDoctor = 'Dr. Ayesha Green';
    let chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '{}');
    
    // Initialize chat history for current doctor
    if (!chatHistory[currentDoctor]) {
      chatHistory[currentDoctor] = [
        {
          type: 'doctor',
          message: 'Hello! I\'m Dr. Ayesha Green. How can I help you today?',
          time: '10:30 AM'
        }
      ];
    }
    
    function loadChat(doctor) {
      const messages = chatHistory[doctor] || [];
      const chatMessages = document.getElementById('chatMessages');
      chatMessages.innerHTML = '';
      
      messages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${msg.type}-message`;
        messageDiv.innerHTML = `
          <div class="message-content">
            <p>${msg.message}</p>
            <span class="message-time">${msg.time}</span>
          </div>
        `;
        chatMessages.appendChild(messageDiv);
      });
      
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Doctor switching
    const doctorItems = document.querySelectorAll('.doctor-item');
    doctorItems.forEach(item => {
      item.onclick = function() {
        // Remove active class from all items
        doctorItems.forEach(d => d.classList.remove('active'));
        // Add active class to clicked item
        item.classList.add('active');
        
        currentDoctor = item.dataset.doctor;
        document.getElementById('currentDoctorName').textContent = currentDoctor;
        
        // Load chat for this doctor
        loadChat(currentDoctor);
      };
    });
    
    // Message sending
    const messageForm = document.getElementById('messageForm');
    if (messageForm) {
      messageForm.onsubmit = function(e) {
        e.preventDefault();
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value.trim();
        
        if (message) {
          const now = new Date();
          const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          
          // Add user message
          if (!chatHistory[currentDoctor]) {
            chatHistory[currentDoctor] = [];
          }
          
          chatHistory[currentDoctor].push({
            type: 'user',
            message: message,
            time: time
          });
          
          // Simulate doctor response
          setTimeout(() => {
            const responses = [
              'Thank you for sharing that information. I understand your concern.',
              'That\'s interesting. Could you tell me more about when this started?',
              'I see. Have you noticed any other symptoms along with this?',
              'Thank you for the details. I recommend scheduling an appointment for further evaluation.',
              'I understand. This could be related to several factors. Let\'s discuss this further.'
            ];
            
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            const responseTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            chatHistory[currentDoctor].push({
              type: 'doctor',
              message: randomResponse,
              time: responseTime
            });
            
            localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
            loadChat(currentDoctor);
          }, 1000);
          
          localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
          loadChat(currentDoctor);
          messageInput.value = '';
        }
      };
    }
    
    // Load initial chat
    loadChat(currentDoctor);
  }

  // CALENDAR FUNCTIONALITY
  if (document.getElementById('calendarDays')) {
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    
    function renderCalendar() {
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      document.getElementById('currentMonth').textContent = `${monthNames[currentMonth]} ${currentYear}`;
      
      const firstDay = new Date(currentYear, currentMonth, 1);
      const lastDay = new Date(currentYear, currentMonth + 1, 0);
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - firstDay.getDay());
      
      const calendarDays = document.getElementById('calendarDays');
      calendarDays.innerHTML = '';
      
      const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      
      for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.textContent = date.getDate();
        
        if (date.getMonth() !== currentMonth) {
          dayDiv.classList.add('other-month');
        }
        
        // Check if day has appointments
        const dayAppointments = appointments.filter(a => a.date === date.toISOString().split('T')[0]);
        if (dayAppointments.length > 0) {
          dayDiv.classList.add('has-appointment');
        }
        
        dayDiv.onclick = function() {
          document.getElementById('appointmentDate').value = date.toISOString().split('T')[0];
        };
        
        calendarDays.appendChild(dayDiv);
      }
    }
    
    // Navigation buttons
    document.getElementById('prevMonth').onclick = function() {
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      renderCalendar();
    };
    
    document.getElementById('nextMonth').onclick = function() {
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      renderCalendar();
    };
    
    // Appointment form
    const appointmentForm = document.getElementById('appointmentForm');
    if (appointmentForm) {
      appointmentForm.onsubmit = function(e) {
        e.preventDefault();
        const appointment = {
          date: document.getElementById('appointmentDate').value,
          time: document.getElementById('appointmentTime').value,
          type: document.getElementById('appointmentType').value,
          notes: document.getElementById('appointmentNotes').value
        };
        
        let appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        appointments.push(appointment);
        localStorage.setItem('appointments', JSON.stringify(appointments));
        
        alert('Appointment booked successfully!');
        appointmentForm.reset();
        renderCalendar();
        loadAppointments();
      };
    }
    
    function loadAppointments() {
      const appointmentsList = document.getElementById('appointmentsList');
      if (appointmentsList) {
        const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        const upcoming = appointments.filter(a => new Date(a.date + ' ' + a.time) > new Date()).sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));
        
        if (upcoming.length > 0) {
          appointmentsList.innerHTML = upcoming.map(a => `
            <div class="appointment-item">
              <h4>${a.type}</h4>
              <p><strong>Date:</strong> ${a.date}</p>
              <p><strong>Time:</strong> ${a.time}</p>
              ${a.notes ? `<p><strong>Notes:</strong> ${a.notes}</p>` : ''}
            </div>
          `).join('');
        } else {
          appointmentsList.innerHTML = 'No upcoming appointments';
        }
      }
    }
    
    renderCalendar();
    loadAppointments();
  }
}); 