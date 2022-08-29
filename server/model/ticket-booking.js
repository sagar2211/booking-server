const mongoose = require('mongoose');

const bookingDetails = mongoose.Schema({
    services: [
        {
          carrier : String,
          code : String,
          date : String,
          location : String,
          passengerSelection : Array,
          quantity : Number,
          segmentSelection : Array,
          text : String,
          serviceType : Number,
          extensions : String,
          id : String
        }
      ],
      remarks : [
        {
          passengerSelection : Array,
          remark : String,
          remarkType : Number,
          segmentSelection : Array,
          typeCode : String
        }
      ],
      ssrServices : [
        {
          carrierCode : String,
          code : String,
          freeText : String,
          passengerSelection : Array,
          segments : Array
        }
      ],
      osi : [
        {
          carrierCode : String,
          freeText : String,
          passengerSelection : Array
        }
      ],
      passengerAPIS : [
        {
          passengerNumber : Number,
          apis : {
            passport : {
              passportType : Number,
              nationality : String,
              country : String,
              expiryDate : {
                day : Number,
                month : Number,
                year : Number
              },
              issueDate : {
                day : Number,
                month : Number,
                year : Number
              },
              number : String,
              placeOfBirth : String,
              holder : Boolean
            },
            visa : {
                visatype : Number,
              appliedCountry : String,
              dateOfIssue : {
                day : Number,
                month : Number,
                year : Number
              },
              number : String,
              placeOfIssue : String
            },
            address : {
            addresstype : Number,
              street : String,
              zip : String,
              city : String,
              state : String,
              country : String,
              municipality : String
            }
          },
          firstName : String,
          lastName : String,
          middleName : String,
          title : String,
          gender : Number,
          dateOfBirth : {
            day : Number,
            month : Number,
            year : Number
          }
        }
      ],
      bookingIndentifier : {
        cartId : String,
        bookingId : String
      }
})

module.exports.bookingDetails = mongoose.model("bookingDetails", bookingDetails);