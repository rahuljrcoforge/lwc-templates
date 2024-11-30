import { LightningElement, wire, api } from "lwc";
import { gql, graphql, refreshGraphQL } from "lightning/uiGraphQLApi";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class GraphQLCombo extends LightningElement {
  contacts;
  contactResults;
  errors;
  searchKey = '';

  @wire(graphql, {
    query: gql`
        query ContactSearchByName ($searchKey: String){
          uiapi {
            query {
              Contact(
              first: 5
              where: {
                Name: { like: $searchKey }
               }
              orderBy: {CreatedDate: {order: DESC}}
              ) {
                edges {
                  node {
                    Id
                    Name {
                      value
                    }
                    MobilePhone{
                      value
                    }
                    Email{
                      value
                    }
                  }
                }
              }
            }
          }
        }
      `,
    variables: '$variables'
  }) gqlQuery(results) {
    this.contactResults = results;
    const { data, errors } = results;
    if (data) {
      this.contacts = data.uiapi.query.Contact.edges.map((edge) => edge.node);
      let contactList = [];
      for (let i = 0; i < this.contacts.length; i++) {
        let obj = Object.assign({}, this.contacts[i]);
        obj.link = '/' + this.contacts[i].Id;
        contactList.push(obj);
      }
      this.contacts = contactList;
    } else if (errors) {
      this.errors = errors;
    }
  }

  get variables() {
    return {
      searchKey: '%' + this.searchKey + '%',
    };
  }

  handleSearch(event) {
    this.searchKey = event.target.value;
  }

  async handleSaveSuccess() {
    this.showToast();
    await refreshGraphQL(this.contactResults);
  }

  showToast() {
    const event = new ShowToastEvent({
      title: 'Success',
      message:
        'Contact Created Successfully',
      variant: 'success',
      mode: 'dismissable',
    });
    this.dispatchEvent(event);
  }
}