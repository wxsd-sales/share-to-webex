# Share to Webex

Join a Webex meeting and instantly start screen sharing.

## Demo
<!--[![Vidcast Overview](https://github.com/wxsd-sales/custom-pmr-pin/assets/19175490/4861e7cd-7478-49cf-bada-223b30810691)](https://app.vidcast.io/share/3f264756-563a-4294-82f7-193643932fb3)-->

Check out our live demo [here](https://share.wbx.ninja)!

## Getting Started

- Clone this repository:
- ```git clone https://github.com/wxsd-sales/share-to-webex.git```

## Installation

### 1. Setting up the Webex Integration

* a. [Create a new Webex Oauth "Integration"](https://developer.webex.com/my-apps/new)
  * i. The creator/owner of the integration does not matter, but must have a Webex account.
  * ii. You can give it any name ("Share to Webex") and any 512x512 icon - the Webex users signing into it will only ever see the name and icon the first time signing in (unless scopes change).
* b. The redirect URI of the integration must be ```YOURSERVERURL/auth```, examples:
  * i. ```http://localhost:5000/auth```
  * ii. ```https://your.server.com/auth```
* c. Whatever your server address, you will need this again in the next steps (just the base url, NOT including "/auth").
* d. The Scopes selected must be:
  * ```meeting:participants_read```
  * ```meeting:preferences_read```
  * ```meeting:controls_read```
  * ```meeting:controls_write```
  * ```spark:all```
* e. Once you create it, save the client_id, and client_secret for the next step

### 2. Setting up the .env file
- a. Inside this project's root folder, rename the file ```example.env``` to ```.env```
- b. In a text editor, open the ```.env``` file  
- c. Choose a ```PORT``` or use ```PORT=10000``` if you are not sure what to use.
- d. Paste the client_id and client_secret values from step 1 to the right of the ```=``` for the corresponding ```CLIENT_ID=``` and ```CLIENT_SECRET=``` variables.
- e. Paste your base url for your server between the double quotes of ```BASE_URI=""```.  If referring to examples from step 1, then either:
  - i. ```BASE_URI="http://localhost:5000"```
  - ii. ```BASE_URI="https://your.server.com"```
- f. Leave the ```SCOPES``` variable set with the existing string value, unless you used difference scopes from step 1 (not recommened).

### 3.a. Running the widget webserver as a container (Docker) (recommended)

- If you prefer to run this through ```npm```, skip this step and proceed to 3.b.
- Otherwise, run the following commands from the terminal inside your project's root directory:
- `docker build -t share-to-webex .`
- `docker run -p 10000:10000 -i -t share-to-webex`
  - If you used a port other than 10000, replace `10000` in both places with the ```PORT``` used in your `.env` file.  

### 3.b. Running the widget webserver (npm)
_Node.js version >= 21.5 must be installed on the system in order to run this through npm._

- It is recommended that you run this as a container (step 3.a.).
- If you do not wish to run the webserver as a container (Docker), proceed with this step:
- Inside this project on your terminal type: `npm install`
- Then inside this project on your terminal type: `npm start`
- This should run the app on your ```PORT``` (from .env file)


**Additional Improvements:**

- You can modify the web app as required.


## License

All contents are licensed under the MIT license. Please see [license](LICENSE) for details.

## Disclaimer

<!-- Keep the following here -->  
Everything included is for demo and Proof of Concept purposes only. Use of the site is solely at your own risk. This site may contain links to third party content, which we do not warrant, endorse, or assume liability for. These demos are for Cisco Webex usecases, but are not Official Cisco Webex Branded demos.
 
 
## Support

Please contact the Webex SD team at [wxsd@external.cisco.com](mailto:wxsd@external.cisco.com?subject=ShareToWebex) for questions. Or for Cisco internal, reach out to us on Webex App via our bot globalexpert@webex.bot & choose "Engagement Type: API/SDK Proof of Concept Integration Development". 
