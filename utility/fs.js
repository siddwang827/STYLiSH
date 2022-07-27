const fs = require('fs');


const createDirectory = (fiePath) => {
    fs.mkdir(fiePath, { recursive: true }, (err) => {
        if (err) { console.log(err) }
        else { console.log('directory created..') }
    })
}

module.exports = { createDirectory }