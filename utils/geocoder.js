const NodeGeocoder = require('node-geocoder')

const options = {
    provider: 'mapquest',
    httpAdapter: 'https',
    apiKey: 'FNG2SWtwCRoTkNXoIsMkTd7F6TXk98UF',
    formatter: null
}

const geocoder = NodeGeocoder(options)

module.exports = geocoder