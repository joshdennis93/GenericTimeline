import { LightningElement, wire, api } from "lwc";
import { getRecordUi } from "lightning/uiRecordApi";
import { NavigationMixin } from "lightning/navigation";

export default class GenericTimelineItem extends NavigationMixin(
  LightningElement
) {
  @api icon;
  buttonClicked;
  cssClasses = "slds-timeline__item_expandable slds-timeline__item_email to-expand";

  //the below are specific to showing the field names/values:
  @api contextRecordId;
  @api record;
  @api fieldNames;
  @api fromObject;
  apiFieldNames = [];
  errorMessage;
  results = [];
  @api title;
  recordPageUrl;
  @api descriptionName;
  @api enableCircle;
  @api radiusMeters;

  handleClick(event) {
    this.buttonClicked = !this.buttonClicked;
    this.cssClasses = this.buttonClicked
      ? "slds-timeline__item_expandable slds-timeline__item_email to-expand slds-is-open"
      : "slds-timeline__item_expandable slds-timeline__item_email to-expand";
  }

  connectedCallback() {
    //takes the fields added in design attributes, and adds to an array with the specified object name prepended.
    //to be honest however, i'm not sure if this does anything. you can query account and set Opportunity as the object api name and it still gets account fields..?
    this.fieldNames.split(",").forEach((fieldName) => {
      this.apiFieldNames.push(this.fromObject + "." + fieldName);
    });
  }

  @wire(getRecordUi, {
    recordIds: "$contextRecordId", //passed in from parent - could potentially be changed to key?
    layoutTypes: "Compact", //compact because the fields we actually want are included in the optionalfields parameter
    modes: "View", //create/edit don't really do anything for us
    optionalFields: "$apiFieldNames" //if the user doesn't have fls to view, the data isn't returned, but no error occurs. this is the array created in connectedCallback().
  })
  recordInformation({ error, data }) {
    //the apex controller only gives us the contextRecordId - for each contextRecordId, the wire finds all the fields. this is what allows the cmp to be dynamic as it decouples the logic from the apex controller.
    if (data) {
      // Generate a URL to the record page
      this[NavigationMixin.GenerateUrl]({
        type: "standard__recordPage",
        attributes: {
          recordId: data.records[this.contextRecordId].id,
          actionName: "view"
        }
      }).then((url) => {
        this.recordPageUrl = url;
      });

      console.log("hello");
      console.log(data);

      let fieldInfo = data.records[this.contextRecordId].fields; //at this point we can also get apiName, childRelationships, id, lastModifiedById/Date, recordTypeId. we can also get objectInfos e.g. data.objectInfos[this.fromObject].fields and pull actual metadata values like childrelationships.
      let matchingFields = [];
      Object.keys(fieldInfo).forEach((fieldName) => {
        let qualifiedFieldName = this.fromObject + "." + fieldName;
        let originalIndex = this.apiFieldNames.indexOf(qualifiedFieldName);
        if (originalIndex > -1) {
          //it's at this point that we start formally adding our specified fields to display
          matchingFields[originalIndex] = {
            fieldName: fieldName,
            value: fieldInfo[fieldName].value
          };
          if (matchingFields[originalIndex].fieldName === this.title) {
            //for the field defined as the title in design attributes, it flags it as true for the html template. we only want to take the first title which matches our design attributes.
            matchingFields[originalIndex].isTitle = true;
          } else {
            matchingFields[originalIndex].isTitle = false; //and otherwise everything else is false
          }
        }
      });
      this.results = matchingFields;
    } else if (error) {
      this.errorMessage = JSON.stringify(error);
    }
  }
}
