const btnSignUp = document.getElementById('btn-signup')
const btnSignIn = document.getElementById('btn-signin')

btnSignUp.addEventListener('click', signUpFetch)
btnSignIn.addEventListener('click', signInFetch)

async function signUpFetch() {
    let name = document.getElementById('signup-name-input').value;
    let email = document.getElementById('signup-email-input').value;
    let password = document.getElementById('signup-password-input').value;
    if (!name || !email || !password) { alert('Please fullfill the infomation!'); return }
    if (password.length < 8) { alert('Password need at least 8 characters!'); return }

    const fetchResult = await fetch('/api/1.0/user/signup', {
        method: "POST",
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    })
    const resultParse = await fetchResult.json()
    if (fetchResult.status !== 200) { alert(resultParse); return }
    localStorage.setItem('access_token', "Bearer " + resultParse.data.access_token)
    window.location.href = '/profile.html'
}

async function signInFetch() {
    let email = document.getElementById('signin-email-input').value;
    let password = document.getElementById('signin-password-input').value;
    if (!email || !password) { alert(`${email ? 'Password' : 'Email'} can not be empty!`); return }

    const fetchResult = await fetch('/api/1.0/user/signin', {
        method: "POST",
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ provider: 'native', email: email, password: password })
    })
    const resultParse = await fetchResult.json()
    localStorage.setItem('access_token', "Bearer " + resultParse.data.access_token)
    window.history.back()
}




