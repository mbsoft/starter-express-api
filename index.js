const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = process.env.PORT || 3000;

// Bing Maps base URL and your API Key
const bingMapsBaseUrl = 'http://ecn.t3.tiles.virtualearth.net/tiles/';
const bingMapsApiKey = 'AoIaUlLeGm5Art5NNr68ZKuqVM5NnuxJG4x6v3qRrgFGfjktTKM8_w-GgMMvku8B';

// Function to convert XYZ to QuadKey
function tileXYToQuadKey(x, y, zoom) {
    let quadKey = '';
    for (let i = zoom; i > 0; i--) {
        let digit = '0';
        const mask = 1 << (i - 1);
        if ((x & mask) != 0) {
            digit++;
        }
        if ((y & mask) != 0) {
            digit++;
            digit++;
        }
        quadKey += digit;
    }
    return quadKey;
}

// Route to handle tile requests
app.get('/tiles/:layer/:z/:x/:y', async (req, res) => {
    const { layer, z, x, y } = req.params;
    const quadKey = tileXYToQuadKey(parseInt(x), parseInt(y), parseInt(z));
    
    // Construct the URL to request the tile from Bing Maps
    const tileUrl = `${bingMapsBaseUrl}a${quadKey}?g=0&key=${bingMapsApiKey}`;
    
    try {
        console.log(tileUrl);
        const response = await fetch(tileUrl);
        const body = await response.buffer();

        res.writeHead(200, {
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=86400', // Example cache header, adjust as needed
        });
        res.end(body);
    } catch (error) {
        console.error('Error fetching Bing Maps tile:', error);
        res.status(500).send('Error fetching tile');
    }
});

app.listen(port, () => {
    console.log(`Tile proxy server listening at cyclic`);
});

