'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  config = require('../../../../config/config'),
  Schema = mongoose.Schema;

/**
 * Death record Schema
 */
var DeathRecordSchema = new Schema({
  caseNumber: {
    required: true,
    type: String
  },
  caseType: {
    required: true,
    type: String,
    enum: ['Partial Autopsy', 'Autopsy', 'OCME Inspection']
  },
  yearOfDeath: {
    required: true,
    type: Number
  },
  monthOfDeath: {
    required: true,
    type: Number
  },
  yearMonthOfDeath: {
    required: true,
    type: Number
  },

  sex: {
    required: true,
    type: String,
    enum: ['Female', 'Male']
  },
  race: {
    required: true,
    type: String,
    enum: ['African American', 'White', 'Asian', 'Other'],
    default: 'Other'
  },
  ageInYearsAtDeath: {
    required: true,
    type: Number
  },
  residenceLocation: {
    latitude: Number,
    longitude: Number,
    censusTract: String,
    neighborhood: String,
    totalPopulation2010: Number
  },
  homeless: {
    type: Boolean,
    default: false
  },
  mannerOfDeath: {
    required: true,
    type: String,
    enum: ['Natural', 'Homicide', 'Undetermined', 'Accident', 'Suicide', 'Missing', 'Suspected Overdose']
  },
  causeOfDeath: {
    required: true,
    type: String
  },
  otherSignificantCondition: {
    type: String
  },
  incidentLocation: {

    latitude: Number,
    longitude: Number,
    censusTract: String,
    neighborhood: String,
    totalPopulation2010: Number
  },
  injuryDescription: {
    type: String
  },
  drugRelated: {
    isDrugRelated: {
      required: true,
      type: Boolean
    },
    drugsInvolved: [{
      type: String,
      enum: ['fentanyl', 'carfentanil', 'carfentanyl', 'wildnil', 'carfentanil23']
    }]
  },
  otherCauses: {
    possHypothermia: Boolean,
    possCarbonMonoxide: Boolean
  },
  reportSignedDate: {
    type: Date
  },
  created: {
    type: Date,
    default: Date.now
  }
});

// if the pii_safe flag is false, also include these other fields
if (!config.db.pii_safe) {
  DeathRecordSchema.add({
    lastName: {
      required: true,
      type: String
    },
    firstName: {
      required: true,
      type: String
    },
    middleInitial: {
      type: String
    },
    suffix: {
      type: String
    },
    dateOfBirth: {
      required: true,
      type: Date
    },
    yearOfBirth: {
      required: true,
      type: Number
    },
    dateOfDeath: {
      type: Date
    },
    incidentLocation: {
      street: String,
      city: String,
      county: String,
      state: String,
      zipcode: String,
      addressString: String
    },
    residenceLocation: {
      street: String,
      city: String,
      county: String,
      state: String,
      zipcode: String,
      addressString: String
    }
  });
}

mongoose.model('DeathRecord', DeathRecordSchema);
