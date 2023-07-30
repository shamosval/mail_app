document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Trigger send_email() function
  document.querySelector('#compose-form').addEventListener('submit', send_email);


  // By default, load the inbox
  load_mailbox('inbox');


});

// Update the counter of unread emails
function upd_unread_count(){

  fetch('/emails/inbox')
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result); 
      let unread_count = 0;

      result.forEach(item => {
        if (item.read === false) {
          unread_count++;
        }
      });

      counter_unread = document.querySelector('#counter_unread');
      if (unread_count !== 0) {
        
        counter_unread.innerHTML = unread_count;
      } else {
        counter_unread.innerHTML = '';
      }
      

    });
}

function compose_email() {
  upd_unread_count();
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#single-email').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function send_email(event) {
    event.preventDefault();
    upd_unread_count();
    // Get the form input values
      
    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;

    // Post to API
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
        
    });

    // Load Sent mailbox after 0.5

    setTimeout(() => {
        load_mailbox('sent');
      }, 500);

  }
 

function reply_btn(email) {
  // Create reply button
  const reply_btn = document.createElement('button');
  reply_btn.classList.add('m-3');
  reply_btn.classList.add('btn-outline-secondary');
  reply_btn.classList.add('btn');
  reply_btn.classList.add('reply-btn-round');
  reply_btn.innerHTML = '<span><i class="bi bi-reply pe-2"></i></span><span>Reply</span>';

  reply_btn.addEventListener('click', () => {
    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('#single-email').style.display = 'none';

    // Prepopulate composition fields
    document.querySelector('#compose-recipients').value = `${email.sender}`;

    if (email.subject.startsWith('Re: ')){
      document.querySelector('#compose-subject').value = `${email.subject}`;
    } else {
      document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
    }
    
    document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: \n ${email.body} \n --------------- \n`;

    
  }); 
  return reply_btn;
}

function archive_btn(email) {
  // Create archive button
  
  const button = document.createElement('button');
  


  // Add event listener and styles to button
  if (email.archived === false) {

    button.classList.add('m-3');
    button.classList.add('btn-outline-secondary');
    button.classList.add('btn');
    button.classList.add('reply-btn-round');
    button.innerHTML = '<span><i class="bi bi-archive pe-2"></i></span><span>Archive</span>';
    button.addEventListener('click', () => {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          archived: true
        })
      })
      .then(() => {
          load_mailbox('inbox');
        })
    }); 
  } else {
    button.classList.add('m-3');
    button.classList.add('btn-outline-secondary');
    button.classList.add('btn');
    button.classList.add('reply-btn-round');
    button.innerHTML = '<span><i class="bi bi-archive pe-2"></i></span><span>Unarchive</span>';
    button.addEventListener('click', () => {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          archived: false
        })
      })
      .then(() => {
          load_mailbox('inbox');
        })
    }); 
  }
  return button;
}

function load_email_sent(id) {
  upd_unread_count();

  //Clear previously opened emails from div
  document.querySelector('#single-email').innerHTML = '';
  

  // Show the email and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#single-email').style.display = 'block';



  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {

      

      // Create a div with email contents

      const sender = email.sender;
      const parts = sender.split('@');
      const sender_name = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();


      const email_head = document.createElement('div');
      email_head.innerHTML = 
      `<div class="p-3">
        <h3 style="color: #4F5251; font-family: sans-serif;">
          ${email.subject}
        </h3>
      </div>`;
      


      const email_body = document.createElement('div');



      email_body.innerHTML = `
      
      <div style="display: flex; justify-content: space-between; padding-left: 15px; padding-right: 15px; align-items:center;">
        <div style="display: flex; align-items:center;">
          <div>
            <strong>${sender_name}</strong>
          </div> 
          <div style="color: #444746; font-size: 14px; padding-left: 5px;">
            &lt;${sender}&gt;
          </div>
        </div>
        <div style="color: #444746; font-size: 14px;">
          ${email.timestamp}
        </div>
      </div>
      <div style="padding-left: 15px; padding-right: 15px; color: #444746; font-size: 14px;">
        to &lt;${email.recipients}&gt;
      </div>
      <div style="padding: 15px; color: #444746; font-size: 15px;">
        ${email.body}
      </div>
      `;





      const mail = document.createElement('div');

      mail.append(email_head, email_body, reply_btn(email));
      

      document.querySelector('#single-email').append(mail);
  });
}

// Loads email

function load_email(id) {
  

  //Clear previously opened emails from div
  document.querySelector('#single-email').innerHTML = '';
  
  // Show the email and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#single-email').style.display = 'block';

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {

      //Set status to 'read'
      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      })

      // Print email to console
      console.log(email);

      upd_unread_count();

      // Create a div with email contents

      const sender = email.sender;
      const parts = sender.split('@');
      const sender_name = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();


      const email_head = document.createElement('div');
      email_head.innerHTML = 
      `<div class="p-3">
        <h3 style="color: #4F5251; font-family: sans-serif;">
          ${email.subject}
        </h3>
      </div>`;
      


      const email_body = document.createElement('div');



      email_body.innerHTML = `
      
      <div style="display: flex; justify-content: space-between; padding-left: 15px; padding-right: 15px; align-items:center;">
        <div style="display: flex; align-items:center;">
          <div>
            <strong>${sender_name}</strong>
          </div> 
          <div style="color: #444746; font-size: 14px; padding-left: 5px;">
            &lt;${sender}&gt;
          </div>
        </div>
        <div style="color: #444746; font-size: 14px;">
          ${email.timestamp}
        </div>
      </div>
      <div style="padding-left: 15px; padding-right: 15px; color: #444746; font-size: 14px;">
        to &lt;${email.recipients}&gt;
      </div>
      <div style="padding: 15px; color: #444746; font-size: 15px;">
        ${email.body}
      </div>
      `;





      const mail = document.createElement('div');

      mail.append(email_head, email_body, reply_btn(email), archive_btn(email));
      

      document.querySelector('#single-email').append(mail);
  });

  upd_unread_count();
}

  
// Loads mailbox

function load_mailbox(mailbox) {

  upd_unread_count();

  // Sets active mailbox's class as 'active'
  menu_btns = document.querySelectorAll('.custom-btn');
  menu_btns.forEach(btn1 =>{
    btn1.classList.remove('active');
  });


  active = document.querySelector(`.${mailbox}`);
  active.classList.add('active');


  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#single-email').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `
  <div class="p-3">
    <h3 style="color: #4F5251; font-family: sans-serif;">${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>
  </div>
  <div class="container">
    <div class="row  fw-lighter">
      <div class="col">From</div>
      <div class="col">Subject</div>
      <div class="col">Timestamp</div>
    </div>
  </div>
    `;




  //Fetch the mailbox JSON

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      
      // Create div for each element in result array
      result.forEach(item => {




        // Create variables to put into fields
        const sender = item.sender;
        const subject = item.subject;
        const id = item.id;
        const time = item.timestamp;
        const read = item.read;

        const body = item.body;

        const parts = sender.split('@');
        const sender_name = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();



        // Create 'element' div with class 'row'
        const element = document.createElement('div');
        element.classList.add('row');
        element.classList.add('p-2');
        

        // Create 3 divs with class 'col' to use bootstrap's grid system
        const column1 = document.createElement('div');
        column1.innerHTML = `<strong>${sender_name}</strong><br><em>${sender}</em>`;
        column1.classList.add('col');


        const column2 = document.createElement('div');
        column2.innerHTML = `${subject}`;
        column2.classList.add('col');

        const column3 = document.createElement('div');
        column3.innerHTML = `${time}`;
        column3.classList.add('col');



        // Append to element

        element.appendChild(column1);
        element.appendChild(column2);
        element.appendChild(column3);


        // Create container where to display the email, the checkbox and the star
        const container = document.createElement('div');
        
        container.classList.add('hover-email');
        container.classList.add('container');
        container.style.cursor = 'pointer';
        container.style.borderTop = '1px solid #ECEFF1';
        container.style.borderBottom = '1px solid #ECEFF1';
        container.style.marginBottom = '1px';
        container.style.padding = '5px';

        //Set background of email 
        if (item.read === false) {
           container.style.backgroundColor = 'white';
         } else {
           container.style.backgroundColor = '#EAF1FB';
         }

         if (mailbox === 'sent') {
           element.classList.add('in_sent');
           element.addEventListener('click', () => load_email_sent(`${id}`));
         } else {
           
           element.addEventListener('click', () => load_email(`${id}`));  
         }

        

        // Append to container
        
        container.appendChild(element);
        

        // Append to div 'emails-view'
        document.querySelector('#emails-view').append(container);

        });

      })

  }





    
      
  

