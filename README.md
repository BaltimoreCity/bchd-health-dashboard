# BCHD Health Dashboard Prototype

This is the prototype dashboard app for the BCHD.

## Building
- in one terminal run: `yarn install` to get dependencies
- in another terminal run: `mongod` to launch mongo, must be running a version greater than 5.0.0
- Set environment variables for the following values, filling in the appropriate values
	- export PS_BCHD_URI=''
	- export SESSION_SECRET=''
	- export CSRF_P3P=''
	- export MAPZEN_API_KEY=''
	- export MONGO_SEED_USER_USERNAME=''
	- export MONGO_SEED_USER_EMAIL=''
	- export MONGO_SEED_ADMIN_USERNAME=''
	- export MONGO_SEED_ADMIN_EMAIL=''
	- export MONGODB_URI_DEV=''
	- export MONGODB_URI=''
- `gulp ingest --file scripts/ingest/ocme-2017-09-11.csv` to populate the mock data
  - *Arguments*
    - The arguments for this task are the file name `--file` and an optional timeout parameter `--timeout`.  The timeout parameter specifies a wait period in milliseconds between each db write. If absent, the default is 200.  The timeout is necessary for throttling calls to the MapZen geocoding API for when that function is necessary.  If the ingest table has addresses but no coordinates, then the `timeout` should be no less than 200.  If the ingest csv already has latitude and longitude along with addresses, then calls to the geocoder will be automatically skipped and the `timeout` can be set to zero.
- `cd scripts/mongo-load; sh load-data-into-mongo.sh` to populate the typeahead table
- `npm start` to launch the service
- navigate to `http://localhost:3000` to see the app
- you can also view it on your mobile device if you are on the same wifi network but getting the IP of your machine running node and visiting `xxx.xxx.xxx.xxx:3000` on your phone.


## New data ingest instructions
  - Export OCME records to CSV.  An example of the CSV column format is located in `scripts/ingest/ocme-2017-09-11.csv`
  - Give this file a simple name with no spaces, for example: `ocme-dec-2017.csv`
  - Copy this file to the folder `scripts/ingest`
  - Open the Git Bash terminal and navigate to the dashboard root folder:
  ```
    cd /c/Temp/<dashboard_folder_name>
  ```
  - Run the command `gulp ingest --file script/ingest/ocme-dec-2017.csv` (or whatever the name of the new file is)
  - This will take about 5 - 10 minutes per 1,000 rows in the CSV since it has to make multiple calls to the geocoder service and the census tract geo-database before writing a new record to the dashboard db.  The ingest task will tick off a prompt every 10 rows as it is making progress.
  - Once the gulp ingest task is done, it will end itself and return back to the prompt in the Git Bash terminal.  The Git Bash terminal window can be closed.
  - The new OCME records will be appended to the of the existing database.  In the event that a new OCME record has the same case number as a record already in the database, the new record will overwrite the old record for that case number.

## Deployment instructions:

- The deployment procedure for the application are done using Shipit, which is a node module that is installed as part of the node modules
- In order to make use of it via the command line, first run `npm i -g shipit-cli`
- Shipit recently also requires [npx](https://www.npmjs.com/package/npx) to run commands
- To deploy, first run `npx shipit staging deploy`
  - If you'd like to deploy a specific branch, you can append `-r <revision>` to the end of the above command
  - The default branch will be `develop`
- Once this is done, you should then stop and start the application:
  - Stop: `npx shipit staging stop-app`
  - Start: `npx shipit staging start-app`

## Data management:

- If necessary, you can drop and ingest the data in the DB using the following commands:
  - Drop: `npx shipit staging dropdb`
  - ingest: `npx shipit staging ingest-db`

## Exporting data for Geo&
Run the gulp task `gulp export_to_csv`, this will create a file `death-records-export-YYYY_MM_DD-hh_mm_ss.csv` in the app root that is a PII-safe pipe delimited dump of the mongo db. That can then be manually transferred over to the Geo& ingest process.


## Data Properties stored in DB
To protect PII,  only certain fields that are needed to support the dashboard app and Geo& are saved into the Mongo db.  This `pii-safe` mode can be configured in `config/env/default.js` or for a particular environment by setting the flag `db.pii_safe`.  Setting this value to `true` will mean that PII is not saved to the database and that the precision of latitude/longitude geocoded address coordinates is reduced based on the config value `db.pii_safe_latlng_precision`.  The default latitude/longitude precision is `4`, which means that the real address is roughly within a 25' radius around the coordinate.  Setting this value to `false` means that all values are stored in the db and that latitude/longitude coordinates are kept at full precision (6).  It is unlikely that the correct real address can be reverse geocoded from coordinates alone, especially if precision is reduced as when `pii_save: true` is set. Even with 6 decimals of precision, a reverse geocoding of coordinates could still return an address several doors up or down from the original address.  Geocoding and then reverse geocoding with different geocoding services will also return different results, further reducing the liklihood that the exact original address would be obtained from coordinates alone.

The following fields are stored to the db with `pii_safe: true`
  - caseNumber
  - caseType
  - sex
  - causeOfDeath
  - otherSignificantCondition
  - injuryDescription
  - yearOfDeath
  - monthOfDeath
  - yearMonthOfDeath
  - reportSignedDate
  - ageInYearsAtDeath
  - mannerOfDeath
  - drugRelated:
    - isDrugRelated
    - drugsInvolved
  - incidentLocation:
    - longitude (reduced to 4 decimal places)
    - latitude (reduced to 4 decimal places)
    - censusTract (of original coordinates)
    - totalPopulation2010 (of censusTract)
  - residenceLocation:
    - longitude (reduced to 4 decimal places)
    - latitude (reduced to 4 decimal places)
    - censusTract (of original coordinates)
    - totalPopulation2010 (of censusTract)
  - homeless
  - race

If `pii_safe: false`, latitude/longitude values are stored 6 decimal places of precision (about one house) and the following fields are included:
  - lastName
  - firstName
  - middleInitial
  - suffix
  - dateOfBirth
  - yearOfBirth
  - dateOfDeath
  - incidentLocation:
    - street
    - city
    - county
    - state
    - zipcode
    - addressString
  - residenceLocation:
    - street
    - city
    - county
    - state
    - zipcode
    - addressString

## Trend analysis notes
Refer to [trend analysis notes](trend-analysis-notes.md) for additional information about trend analysis research and impementation for app.
