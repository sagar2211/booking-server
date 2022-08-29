const router = require("express").Router();
const soapRequest = require("easy-soap-request");
const fs = require("fs");

router.get("/describe", async (req, res) => {
  // example data
  const url = "https://graphical.weather.gov/xml/SOAP_server/ndfdXMLserver.php";

  const sampleHeaders = {
    "user-agent": "sampleTest",
    "Content-Type": "text/xml;charset=UTF-8",
    soapAction:
      "https://graphical.weather.gov/xml/DWMLgen/wsdl/ndfdXML.wsdl#LatLonListZipCode",
  };

  const xml = fs.readFileSync("server/routes/soapTest.xml", "utf-8");
  try {
    const response = await soapRequest({
      url: url,
      headers: sampleHeaders,
      xml: xml
    });
    const { headers, body, statusCode } = response;
    console.log(headers);
    console.log(body);
    console.log(statusCode);
    document.body.innerHTML = body;
    res.send(response.body);
  } catch (error) {
    console.log("err", error);
    res.send(error);
  }
});

router.get("/hHikerTest", async (req, res) => {
  // example data
  const url ="http://flightapi-fra01-ibetest.hitchhiker.net:7725/FlightAPI?wsdl";

  const sampleHeaders = {
    "user-agent": "sampleTest",
    "Content-Type": "text/xml;charset=UTF-8",
    soapAction: "http://flightapi-fra01-ibetest.hitchhiker.net:7725/FlightAPI?singleWsdl",
  };

  const xml = fs.readFileSync("server/routes/soapTest.xml", "utf-8");
  try {
    const response = await soapRequest({
      url: url,
      headers: sampleHeaders,
      xml: xml,
    });
    const { headers, body, statusCode } = response;
    console.log(headers);
    console.log(body);
    console.log(statusCode);
    document.body.innerHTML = body;
    res.send(response.body);
    }catch (error){
    console.log("err", error);
    res.send(error);
  }
});

module.exports = router;
