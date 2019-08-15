# Bill-Reader

Bill-Reader is a command line program that processes and parses bill/receipt images to fetch shop and item data, which can then be leveraged to build dynamic catalogs.

Bill-Reader uses Azure Computer Vision API. To try out Bill-Reader, please get a free API Key from [here](https://azure.microsoft.com/en-us/try/cognitive-services/?api=computer-vision) and add it as `subscriptionKey` in the code.

To run:
- npm install
- Add `subscriptionKey`
- node index.js `<optional img url>`

This was built as part of [Blume Bootstrap Paradox](https://skillenza.com/challenge/bootstrap-paradox) Hackathon for [Dunzo](https://www.dunzo.com), and integrated into mainstream web application [here](https://github.com/sushma-priyadharssini/dun-dunzo). 
