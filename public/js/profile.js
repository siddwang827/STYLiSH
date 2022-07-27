const cdnDomain = 'https://di6i27gdqbz7x.cloudfront.net'

async function checkAccessToken() {
    try {
        const accessToken = localStorage.getItem('access_token')
        if (!accessToken) { return window.location.replace('/auth.html') }

        const fetchResult = await fetch('/api/1.0/user/profile', {
            method: "get",
            headers: {
                'content-type': 'application/json',
                'Authorization': accessToken
            },
        })
        const resultParse = await fetchResult.json()

        if (fetchResult.status === 200) {
            let { provider, name, email, picture } = resultParse.data
            let profileDiv = (document.querySelector('.profile-container'))
            let [profileName, profileImage, profileEmail, profileProvider, btnLogOut] = Array.from(profileDiv.children)

            profileName.textContent = name.toString()
            profileEmail.textContent = email.toString()
            profileProvider.textContent = `Login by ${provider.toString()}`
            profileImage.src = `${cdnDomain}/${picture.toString()}`
            btnLogOut.classList.add("btn-submit")
            btnLogOut.textContent = 'Log Out';
        }
        else if (fetchResult.status === 403) {
            alert(`${resultParse.error}. Please Log In`)
            window.location.replace('/auth.html')
            return
        }

    }
    catch (err) {
        console.log(err)
        window.location.replace('/auth.html')
    }
}

checkAccessToken()

function signOut() {
    localStorage.removeItem('access_token')
    window.location.replace('/')
}

const btnSignIn = document.getElementById('btn-logout')
btnSignIn.addEventListener('click', signOut)
