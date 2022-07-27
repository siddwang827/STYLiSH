const axios = require('axios')

async function ddos(num) {

    try {
        // const fetchResult = await axios({ url: 'https://stylishapp.store/api/1.0/products/details?id=334430' })
        const fetchResult = await axios({ url: 'https://stylishapp.store/test' })
        console.log(fetchResult.data)

    }
    catch (err) {
        console.log(err.response.data)
    }
}

for (let i = 0; i < 1000; i++) {
    setTimeout(ddos, 60 * i)
}
