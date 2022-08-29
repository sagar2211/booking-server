
const winstonLogger = require("../../libs/winstonLib");
var request = require("request");
const _ = require("lodash");
const xml2js = require('xml2js');
var passengerInfo;
var searchObj;
var flightInfo;
const fetch = require("node-fetch");

exports.getProduct = async (req, res) => {
  passengerInfo = req.body.travellerInfo;
  searchObj = req.body.searchObj;
  flightInfo = req.body.flightInfo;
  var traveldData = "";
  var insuredData="";
  if(passengerInfo.adultArray.length){
    _.map(passengerInfo.adultArray,(itr,indx)=>{
      insuredData += generateObj(itr,indx,passengerInfo.adultArray);
    })
  }
  if(passengerInfo.childArray.length){
    _.map(passengerInfo.childArray,(itr,indx)=>{
      indx = passengerInfo.adultArray.length + indx;
      insuredData += generateObj(itr,indx,passengerInfo.adultArray);
    })
  }
  if(passengerInfo.infantArray.length){
    _.map(passengerInfo.infantArray,(itr,indx)=>{
      indx = passengerInfo.adultArray.length + passengerInfo.childArray.length + indx;
      insuredData += generateObj(itr,indx,passengerInfo.adultArray);
    })
  }

  let segmentsInfo = flightInfo.legs[0].connections[0].segments;
  if(segmentsInfo.length){
    _.map(segmentsInfo,(itr,indx)=>{
      traveldData += generateTravelInfo(itr,indx,searchObj);
    })
  }

  let XMlProductReq = generateFinalObj(insuredData,searchObj,traveldData);
  request.post({
    url: `${process.env.HEPSTAR_URL}/products/priced`,
    method: "POST",
    headers: {
      'Content-Type': 'application/xml',
    },
    body: XMlProductReq
  }, (error, response, body) => {
    if (error) {
      winstonLogger.error(response.statusCode, error)
      res.status(response.statusCode).send(error)
    } else {
      // winstonLogger.info(response)
      res.status(response.statusCode).send({
        response: response.body
      })
    }
  });
}

function generateObj(data,indx,adultArray) { 
  let insuredData = `<Insured ID="${indx+1}">
  <DOB>${data.dateOfBirth.year}-${data.dateOfBirth.month}-${data.dateOfBirth.day}</DOB>
  <Residency>${data?.phone?.countryCode ? data.phone.countryCode : adultArray[0].phone.countryCode}</Residency>
  <Gender>${data.prefix === 'Mr' ? 'male' : (data.prefix === 'Mrs' ? 'female' : 'other')}</Gender>
  <TravelInformation>
    <TravelItemValue>50</TravelItemValue>
  </TravelInformation>
</Insured>`
  
  return insuredData;
}

function generateTravelInfo(travelInfo,indx,searchObj) { 
  var depart_date;
  var arrival_date;
  if(searchObj.tripType === 'One Way'){
    let dateInfo = searchObj.segments[0].departureDate;
    depart_date = dateInfo.year + "-" + dateInfo.month + "-" + dateInfo.day;
    arrival_date = dateInfo.year + "-" + dateInfo.month + "-" + dateInfo.day;
  }

  let traveldData = `<FlightInformation Segment="${indx+1}">
  <Airline>CX</Airline>
  <FlightNumber>${travelInfo.flightNumber}</FlightNumber>
  <StartDate>${depart_date}</StartDate>
  <EndDate>${arrival_date}</EndDate>
  <OriginCity>${travelInfo.departureAirport.cityCode}</OriginCity>
  <DestinationCity>${travelInfo.arrivalAirport.cityCode}</DestinationCity>
  <CoverCountries>
    <CoverCountry>${travelInfo.arrivalAirport.countryCode}</CoverCountry>
  </CoverCountries>
</FlightInformation>`
  
  return traveldData;
}

function generateFinalObj(data,searchObj,traveldData){
  var depart_date;
  var arrival_date;
  if(searchObj.tripType === 'One Way'){
    let dateInfo = searchObj.segments[0].departureDate;
    depart_date = dateInfo.year + "-" + dateInfo.month + "-" + dateInfo.day;
    arrival_date = dateInfo.year + "-" + dateInfo.month + "-" + dateInfo.day;
  }
  let XMlProductReq = `<Request>
<Authentication>
  <Channel>hepstar_integration</Channel>
  <Session>113b7530-6100-4499-b2fc-03823f92cca8</Session>
  <Username>impdistributor</Username>
  <Password>FFRyEGGmMJYHA</Password>
  <Locale>en_GB</Locale>
  <Currency>USD</Currency>
</Authentication>
<RequestParameters>
  <Insureds>
    ${data}
  </Insureds>
  <TravelInformation>
    <StartDate>${depart_date}</StartDate>
    <EndDate>${arrival_date}</EndDate>
    <DepartureCountry>TR</DepartureCountry>
    <CoverCountries>
      <CoverCountry>TR</CoverCountry>
    </CoverCountries>
    <BookingValue>50</BookingValue>
    <FlightInformations>
    ${traveldData}
    </FlightInformations>
  </TravelInformation>
</RequestParameters>
</Request>`;
return XMlProductReq;
}

exports.getInsurance = async (req, res) => {
  request.post({
    url: `${process.env.HEPSTAR_URL}/products/priced/insurance`,
    method: "POST",
    headers: {
      'Content-Type': 'application/xml',
    },
    body: XMlReq
  }, (error, response, body) => {
    if (error) {
      winstonLogger.error(response.statusCode, error)
      res.status(response.statusCode).send(error)
    } else {
      winstonLogger.info(response)
      res.status(response.statusCode).send({
        response: response
      })
    }
  });
}

exports.purchaseProduct = async (req) => {
  // return true
  let passengerInfo = req.travellerInfo;
  let searchObj = req.searchObj;
  let flightInfo = req.flightInfo;
  var responceData = {}; 

  let XMlReq =  generatePolicyReq (passengerInfo,searchObj,flightInfo);
  // console.log("XMlReq",XMlReq);
   await fetch(`${process.env.HEPSTAR_URL}/products/purchase`,
  {
    method: "post",
    headers: {
      'Content-Type': 'application/xml',
    },
    body: XMlReq
  }).then(response => response.text()).then((response) => {
    // console.log("response",response);
    var parser = new xml2js.Parser({
      explicitArray : false
    })
     return parser.parseString(response, async(err, result) => {
      if (err) {
        // console.log("response",response);
        responceData = {
          status: 'error',
          result: response
        }
        return responceData;
      } else {
        finalData(result);
      }
    })
  })
  function finalData(data){
    console.log("hepstarData", data);
    responceData ={
      status: 'success',
      result: data
    } 
  };
  return responceData
}

function generatePolicyReq (passengerInfo,searchObj,flightInfo){
  var insuredData="";
  var traveldData = ""
  let segmentsInfo = flightInfo.legs[0].connections[0].segments;

  if(segmentsInfo.length){
    _.map(segmentsInfo,(itr,indx)=>{
      traveldData += generateTravellingInfo(itr,indx,searchObj);
    })
  }

  if(passengerInfo.adultArray.length){
    _.map(passengerInfo.adultArray,(itr,indx)=>{
      // insuredData += generatePolicyObj(itr,indx,searchObj,passengerInfo.adultArray,traveldData);
      insuredData += generateInsuredData(itr,indx,passengerInfo.adultArray);
    })
  }
  
  if(passengerInfo.childArray.length){
    _.map(passengerInfo.childArray,(itr,indx)=>{
      indx = passengerInfo.adultArray.length + indx;
      // insuredData += generatePolicyObj(itr,indx,searchObj,passengerInfo.adultArray,traveldData);
      insuredData += generateInsuredData(itr,indx,passengerInfo.adultArray);
    })
  }

  if(passengerInfo.infantArray.length){
    _.map(passengerInfo.infantArray,(itr,indx)=>{
      indx = passengerInfo.adultArray.length + passengerInfo.childArray.length + indx;
      // insuredData += generatePolicyObj(itr,indx,searchObj,passengerInfo.adultArray,traveldData);
      insuredData += generateInsuredData(itr,indx,passengerInfo.adultArray);
    })
  }
  var depart_date;
  var arrival_date;
  if(searchObj.tripType === 'One Way'){
    let dateInfo = searchObj.segments[0].departureDate;
    depart_date = dateInfo.year + "-" + dateInfo.month + "-" + dateInfo.day;
    arrival_date = dateInfo.year + "-" + dateInfo.month + "-" + dateInfo.day;
  } else if(searchObj.tripType === 'Round Trip'){
    let dateInfo = searchObj.segments[0].departureDate;
    let dateInfo1 = searchObj.segments[1].departureDate;
    depart_date = dateInfo.year + "-" + dateInfo.month + "-" + dateInfo.day;
    arrival_date = dateInfo1.year + "-" + dateInfo1.month + "-" + dateInfo1.day;
  }
  
  var XMlReq = `<Request>
	<Authentication>
		<Channel>hepstar_integration</Channel>
		<Session>48e2ae3d-89b7-4a21-9b18-a1c0f5a2c91c</Session>
		<Username>impdistributor</Username>
		<Password>FFRyEGGmMJYHA</Password>
		<Locale>en_GB</Locale>
		<Currency>USD</Currency>
	</Authentication>
	<RequestParameters>
		<PolicyRequests>
			<PolicyRequest>
				<DistributerReference>TestBooking12345678</DistributerReference>
				<ProductID>TestRP</ProductID>
				<Insureds>
					<Insured ID="1">
						<Firstname>Hepstar</Firstname>
						<Surname>Test</Surname>
						<DOB>1980-01-02</DOB>
						<Residency>TR</Residency>
						<NationalID>11234566666</NationalID>
						<PassportNumber>66543211111</PassportNumber>
						<Gender>male</Gender>
						<TravelInformation>
							<TravelItemValue>50</TravelItemValue>
						</TravelInformation>
					</Insured>
				</Insureds>
				<ContactInformation>
					<Address>
						<Text>5 Church street</Text>
						<City>Istanbul</City>
						<Country>TR</Country>
						<PostalCode>1001</PostalCode>
					</Address>
					<Phones>
						<Phone Type="Mobile">
							<Number>27725496325</Number>
						</Phone>
					</Phones>
					<Email>test@hepstar.com</Email>
				</ContactInformation>
				<TravelInformation>
					<StartDate>2022-01-01</StartDate>
					<EndDate>2022-01-06</EndDate>
					<DepartureCountry>TR</DepartureCountry>
					<CoverCountries>
						<CoverCountry>TR</CoverCountry>
					</CoverCountries>
					<BookingValue>50</BookingValue>
				</TravelInformation>
			</PolicyRequest>
		</PolicyRequests>
		<Payment>
		  <CardType>Visa</CardType>
		  <CardHolder>TestTest</CardHolder>
		  <CardNumber>4242424242424242</CardNumber>
		  <CardVerificationCode>123</CardVerificationCode>
		  <ExpireMonth>07</ExpireMonth>
		  <ExpireYear>2023</ExpireYear>
		</Payment>
	</RequestParameters>
</Request>`;
return XMlReq
}

 function generateInsuredData (passengerInfo,indx, AdultArr){
  console.log("passengerInfo.dateOfBirth.year",passengerInfo.dateOfBirth.startDate);
if(passengerInfo.type ==="INF"){
  passengerInfo.phone = {}
  passengerInfo.phone = AdultArr[0].phone
}

  let insuredData = `<Insured ID="${indx+1}">
  <Firstname>${passengerInfo.firstName}</Firstname>
  <Surname>${passengerInfo.lastName}</Surname>
  <DOB>${passengerInfo.dateOfBirth.startDate}</DOB>
  <Residency>+91</Residency>
  <NationalID>1234566</NationalID>
  <PassportNumber>6543211</PassportNumber>
  <Gender>${passengerInfo.prefix === 'Mr' ? 'male' : (passengerInfo.prefix === 'Mrs' ? 'female' : 'other')}</Gender>
  <TravelInformation>
    <TravelItemValue>50</TravelItemValue>
  </TravelInformation>
</Insured>`;
return insuredData;
}

function generateTravellingInfo (travelInfo,indx,searchObj){ 
  var depart_date;
  var arrival_date;
  if(searchObj.tripType === 'One Way'){
    let dateInfo = searchObj.segments[0].departureDate;
    depart_date = dateInfo.year + "-" + dateInfo.month + "-" + dateInfo.day;
    arrival_date = dateInfo.year + "-" + dateInfo.month + "-" + dateInfo.day;
  } else if(searchObj.tripType === 'Round Trip'){
    let dateInfo = searchObj.segments[0].departureDate;
    let dateInfo1 = searchObj.segments[1].departureDate;
    depart_date = dateInfo.year + "-" + dateInfo.month + "-" + dateInfo.day;
    arrival_date = dateInfo1.year + "-" + dateInfo1.month + "-" + dateInfo1.day;
  }

  let traveldData = `
  <FlightInformations>
  <FlightInformation Segment="${indx+1}">
  <Airline>CX</Airline>
  <FlightNumber>${travelInfo.flightNumber}</FlightNumber>
  <StartDate>${depart_date}</StartDate>
  <EndDate>${arrival_date}</EndDate>
  <OriginCity>${travelInfo.departureAirport.cityCode}</OriginCity>
  <DestinationCity>${travelInfo.arrivalAirport.cityCode}</DestinationCity>
  <CoverCountries>
    <CoverCountry>${travelInfo.arrivalAirport.countryCode}</CoverCountry>
  </CoverCountries>
  </FlightInformation>
  </FlightInformations>`


  
  
  return traveldData;
}


// generatePolicyObj = (passengerInfo,indx,searchObj,adultPassengerArray,traveldData) =>{
//   // console.log("passengerInfo",passengerInfo);
//   let policyObj = `<PolicyRequest>
//   <DistributerReference>TestBooking123</DistributerReference>
//   <ProductID>TestRP</ProductID>
//   <Insureds>
  
//   </Insureds>
  
//   <TravelInformation>
//     ${traveldData}
//   </TravelInformation>
// </PolicyRequest>`;
// return policyObj;
// }