const NodeGeocoder = require('node-geocoder')

const options = {
    provider: 'mapquest',
    httpAdapter: 'https',
    apiKey: 'FNG2SWtwCRoTkNXoIsMkTd7F6TXk98UF',
    // provider: process.env.GEOCODER_PROVIDER,
    // apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
}

const geocoder = NodeGeocoder(options)

module.exports = geocoder