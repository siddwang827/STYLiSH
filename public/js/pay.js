TPDirect.setupSDK(12348, 'app_pa1pQcKoY22IlnSXq5m5WP5jFKzoRG58VEXpT7wU62ud7mMbDOGzCYIlzzLF', 'sandbox')

let fields = {
    number: {
        element: '#card-number',
        placeholder: '**** **** **** ****',
    },
    expirationDate: {
        element: document.getElementById('card-expiration-date'),
        placeholder: 'MM / YY'
    },
    ccv: {
        element: '#card-ccv',
        placeholder: 'ccv'
    }
}

TPDirect.card.setup({
    fields: fields,
    styles: {
        'input': {
            'color': 'gray'
        },
        'input.ccv': {
            'font-size': '16px'
        },
        '.valid': {
            'color': 'green'
        },
        '.invalid': {
            'color': 'red'
        },
    }
})

TPDirect.card.onUpdate(function (update) {
    if (update.canGetPrime) {
        console.log("Can get prime")
    }
})
// TPDirect.card.getTappayFieldsStatus()
