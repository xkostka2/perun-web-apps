/**
 * Return string representing Material icon for status of given member.
 *
 * @param richMember member
 */
import {
  Group,
  Owner,
  RichMember,
  RichUser,
  User,
  Candidate, ApplicationMail, ApplicationFormItem, RichGroup, Author
} from '@perun-web-apps/perun/openapi';
import { Attribute, AttributeDefinition } from '@perun-web-apps/perun/openapi';
import { MatDialogConfig } from '@angular/material/dialog';
import { formatDate } from '@angular/common';
import { MatSort } from '@angular/material/sort';



export const TABLE_ITEMS_COUNT_OPTIONS = [5, 10, 25, 100, 1000, 10000];

export function parseStatusIcon(richMember: RichMember): string {
  switch (richMember.status) {
    case 'VALID':
      return 'verified_user';
    case 'INVALID':
      return 'report';
    case 'EXPIRED':
      return 'schedule';
    case 'DISABLED':
      return 'delete';
  }
}

/**
 * Return color which should be used for icon of given member's status.
 *
 * @param richMember member
 */
export function parseStatusColor(richMember: RichMember): string {
  switch (richMember.status) {
    case 'VALID':
      return 'accent';
    case 'INVALID':
      return 'warn';
    default:
      return '';
  }
}

/**
 * Gets email of given member. The preferred email has top priority, the vo-email
 * has lower priority. If there are no emails, an empty string is returned.
 *
 * @param richMember RichMember
 */
export function parseEmail(richMember: RichMember): string {
  let email = '';
  if (richMember && richMember.userAttributes !== null) {

    richMember.userAttributes.forEach(attr => {
      if (attr.friendlyName === 'preferredMail') {
        email = <string><unknown>attr.value;
      }
    });

    if ( email && email.length === 0 && richMember.memberAttributes !== null) {
      richMember.memberAttributes.forEach(attr => {
        if (attr.friendlyName === 'mail' && attr.value !== null) {
          email = <string><unknown>attr.value;
        }
      });
    }



  }
  return email;
}

/**
 * Gets email of given user. If there are no emails, an empty string is returned.
 *
 * @param richUser RichUser
 */
export function parseUserEmail(richUser: RichUser): string {
  let email = '';
  if (richUser) {
    richUser.userAttributes.forEach(attr => {
      if (attr.friendlyName === 'preferredMail') {
        email = <string><unknown>attr.value;
      }
    });
  }
  return email;
}

export function parseUserLogins(richUser: RichUser): string {
  let logins = '';
  if (!!richUser && !!richUser.userAttributes) {
    richUser.userAttributes
      .filter(attr => attr.baseFriendlyName === 'login-namespace')
      .filter(attr => attr.value !== null)
      .forEach(attr => {
        logins += attr.friendlyNameParameter + ": " + attr.value + ", ";
    })
  }

  if (logins.endsWith(', ')) {
    logins = logins.substring(0, logins.length-2);
  }
  return logins;
}

/**
 * Get logins of given member.
 *
 * @param richMember member
 */
export function parseLogins(richMember: RichMember|RichUser): string {
  let logins = '';

  if(!!richMember && !!richMember.userAttributes){
    richMember.userAttributes
      .filter(attr => attr.baseFriendlyName === 'login-namespace')
      .filter(attr => attr.value !== null)
      .forEach(attr => {
        logins += attr.friendlyNameParameter + ": " + attr.value + ", ";
      });
  }

  if (logins.endsWith(', ')) {
    logins = logins.substring(0, logins.length - 2);
  }
  return logins;
}

export function parseUrnsToUrlParam(paramName: string, urns: string[]): string {
  let attributesParam = '';
  urns.forEach(a => attributesParam = attributesParam.concat(`&${paramName}%5B%5D=`).concat(a));
  return attributesParam;
}

/**
 * Creates full name for given user form his titles and names.
 *
 * @param user user
 */
export function parseFullName(user: User | Candidate): string {
  let fullName = '';

  if (user.titleBefore !== null) {
    fullName += user.titleBefore + ' ';
  }
  if (user.firstName !== null) {
    fullName += user.firstName + ' ';
  }
  if (user.middleName !== null) {
    fullName += user.middleName + ' ';
  }
  if (user.lastName !== null) {
    fullName += user.lastName + ' ';
  }
  if (user.titleAfter !== null) {
    fullName += user.titleAfter + ' ';
  }
  if (fullName.endsWith(' ')) {
    fullName = fullName.substring(0, fullName.length - 1);
  }

  return fullName;
}

/**
 * Creates name for given user. Returns users name without his titles.
 *
 * @param user user
 */
export function parseName(user: User | Candidate): string {
  let fullName = '';
  if (user.firstName !== null) {
    fullName += user.firstName + ' ';
  }
  if (user.middleName !== null) {
    fullName += user.middleName + ' ';
  }
  if (user.lastName !== null) {
    fullName += user.lastName + ' ';
  }
  if (fullName.endsWith(' ')) {
    fullName = fullName.substring(0, fullName.length - 1);
  }

  return fullName;
}

/**
 * Returns friendly name transformed from camel case to sentence like string
 * (eg. friendlyName -> Friendly name)
 *
 * @param friendlyName friendly name of the attribute
 */
export function parseAttributeFriendlyName(friendlyName: string): string{
  let name = "";
  const words = friendlyName.split(/(?=[A-Z])/g);
  words.forEach(word => {
    name = name.concat(word.toLowerCase());
    name = name.concat(' ');
  })
  name = name.charAt(0).toUpperCase() + name.slice(1, name.length - 1);

  return name;
}

/**
 * Returns attribute with specific urn from given rich user.
 * If the given user doesn't have attribute with given urn, null is returned.
 *
 * @param user user with attributes
 * @param urn urn for required attribute
 */
export function getRichUserAttribute(user: RichUser, urn: string): Attribute {
  for (const attribute of user.userAttributes) {
    const attributeUrn = attribute.namespace + ':' + attribute.friendlyName;
    if (attributeUrn === urn) {
      return attribute;
    }
  }

  return null;
}

export function parseTechnicalOwnersNames(owners: Owner[]): string {
  let names = '';
  for (const owner of owners) {
    if (owner.type === 'technical') {
      names += owner.name + ', ';
    }
  }
  if (names.endsWith(', ')) {
    names = names.substring(0, names.length - 2);
  }
  return names;
}

export async function doAfterDelay(delayMs: number, callback: () => void) {
  await delay(delayMs);
  callback();
}

export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Returns saved ids for given key.
 *
 * @param key of local storage
 */
export function getRecentlyVisitedIds(key: string): any[] {
  const recentIds: number[] = JSON.parse(localStorage.getItem(key));
  if (recentIds) {
    return recentIds;
  }
  return [];
}

/**
 * Add entity that was just visited to localStorage.
 *
 * @param key of localStorage
 * @param item entity that was visited
 */
export function addRecentlyVisited(key: string, item: any) {
  if (localStorage.getItem(key) === null) {
    // if user not have any in local storage
    const recent: number[] = [];
    recent.unshift(item.id);
    localStorage.setItem(key, JSON.stringify(recent));
  } else {
    const recent: number[] = JSON.parse(localStorage.getItem(key));
    const index = indexOfEntity(recent, item.id);
    if (index > 0) {
      // if entity is in recent but not of first place, then we remove it to placed it first
      recent.splice(index, 1);
    }
    if (index !== 0) {
      // place the element as first
      recent.unshift(item.id);
    }
    if (recent.length > 5) {
      // pop last element if length exceed 5 vo
      recent.pop();
    }
    localStorage.setItem(key, JSON.stringify(recent));
  }
}

/**
 * Add object that was just visited to 'recent' localStorage.
 *
 * @param item entity that was visited
 */
export function addRecentlyVisitedObject(item: any) {
  if (localStorage.getItem('recent') === null) {
    // if user not have any in local storage
    let recent;
    if (item.beanName === 'Group') {
      recent = [{id: item.id, name: item.shortName, type: item.beanName, voId: item.voId}];
    } else {
      recent = [{id: item.id, name: item.name, type: item.beanName, voId: item.voId}];
    }
    localStorage.setItem('recent', JSON.stringify(recent));
  } else {
    const recent: any[] = JSON.parse(localStorage.getItem('recent'));
    let object;
    if (item.beanName === 'Group') {
      object = {id: item.id, name: item.shortName, type: item.beanName, voId: item.voId};
    } else {
      object = {id: item.id, name: item.name, type: item.beanName, voId: item.voId};
    }
    const index = indexOfObject(recent, object);
    if (index > 0) {
      // if object is in recent but not of first place, then we remove it to placed it first
      recent.splice(index, 1);
    }
    if (index !== 0) {
      // place the element as first
      recent.unshift(object);
    }
    if (recent.length > 5) {
      // pop last element if length exceed 5 vo
      recent.pop();
    }
    localStorage.setItem('recent', JSON.stringify(recent));
  }
}

export function indexOfObject(recent: any[], object: any) {
  for (let i = 0; i < recent.length; i++) {
    if (recent[i].id === object.id) {
      if (recent[i].type === object.type) {
        return i;
      }
    }
  }
  return -1;
}

export function indexOfEntity(recent: number[], id: number) {
  for (let i = 0; i < recent.length; i++) {
    if (recent[i] === id) {
      return i;
    }
  }
  return -1;
}

/**
 * Gets Vo of given user.
 *
 * @param richUser RichUser
 */
export function parseVo(richUser: RichUser): string {
  let result = '';
  if (richUser) {
    richUser.userAttributes.forEach(attr => {
      if (attr.friendlyName === 'organization') {
        result = <string><unknown>attr.value;
      }
    });
  }
  return result;
}
/**
 * From given attributes array removes all core attributes.
 *
 * @param attributes non core attributes
 */
export function filterCoreAttributes(attributes: Attribute[]): Attribute[] {
  return attributes.filter(attribute => !attribute.namespace.includes('def:core'));
}

/**
 * Find parents of given group in field of groups
 * @param group that you parent you want to found
 * @param groups field of groups where you want to find parent
 * return field of parents
 */
export function findParent(group: number, groups: Group[]): Group[] {
  const parent = groups.find( x => x.id === group);
  if (parent) {
    if (parent.parentGroupId) {
      return findParent(parent.parentGroupId, groups).concat(parent);
    } else {
      return [parent];
    }
  } else {
    return [];
  }
}

/**
 * Finds attribute with given attrName from given attributes.
 *
 * @param attributes attributes
 * @param attrName attr name
 * @return attribute with given name or null if not found
 */
export function getAttribute(attributes: Attribute[], attrName: string) : Attribute {
  for (const attribute of attributes) {
    if ((attribute.namespace + ":" + attribute.friendlyName) === attrName) {
      return attribute;
    }
  }
  return null;
}

/**
 * Find candidate email in his attributes
 * @param candidate
 * @return candidate email
 */
export function getCandidateEmail(candidate: Candidate): string {
  if (candidate.attributes['urn:perun:member:attribute-def:def:mail'] != null) {
    return candidate.attributes['urn:perun:member:attribute-def:def:mail'];
  } else if (candidate.attributes['urn:perun:user:attribute-def:def:preferredMail'] != null) {
    return candidate.attributes['urn:perun:user:attribute-def:def:preferredMail'];
  }
  return "";
}

export function getExtSourceNameOrOrganizationColumn(candidate: Candidate): string {
  if (candidate.userExtSource.extSource.type.toLowerCase() === "cz.metacentrum.perun.core.impl.ExtSourceX509".toLowerCase()) {
    return convertCertCN(candidate.userExtSource.extSource.name);
  } else if (candidate.userExtSource.extSource.type.toLowerCase() === "cz.metacentrum.perun.core.impl.ExtSourceIdp".toLowerCase()) {
    return translateIdp(candidate.userExtSource.extSource.name);
  } else {
    return candidate.userExtSource.extSource.name;
  }
}

/**
 * If passed string is DN of certificate(recognized by "/CN=") then returns only CN part with unescaped chars.
 * If passed string is not DN of certificate, original string is returned.
 *
 * @param toConvert
 * @return
 */
export function convertCertCN(toConvert: string): string {

  if (toConvert.includes("/CN=")) {
    const splitted = toConvert.split("/");
    for (const s in splitted) {
      if (s.startsWith("CN=")) {
        return unescapeDN(s.substring(3));
      }
    }
  }
  return toConvert;
}

export function unescapeDN(string: string): string {

  return decodeURIComponent(string.replace(/\\x/g, '%'));

}

export function translateIdp(name: string): string {

  switch (name) {
    case 'https://idp.upce.cz/idp/shibboleth':
      return 'University in Pardubice';
    case 'https://idp.slu.cz/idp/shibboleth':
      return 'University in Opava';
    case 'https://login.feld.cvut.cz/idp/shibboleth':
      return 'Faculty of Electrical Engineering, Czech Technical University In Prague';
    case 'https://www.vutbr.cz/SSO/saml2/idp':
      return 'Brno University of Technology';
    case 'https://shibboleth.nkp.cz/idp/shibboleth':
      return 'The National Library of the Czech Republic';
    case 'https://idp2.civ.cvut.cz/idp/shibboleth':
      return 'Czech Technical University In Prague';
    case 'https://shibbo.tul.cz/idp/shibboleth':
      return 'Technical University of Liberec';
    case 'https://idp.mendelu.cz/idp/shibboleth':
      return 'Mendel University in Brno';
    case 'https://cas.cuni.cz/idp/shibboleth':
      return 'Charles University in Prague';
    case 'https://wsso.vscht.cz/idp/shibboleth':
      return 'Institute of Chemical Technology Prague';
    case 'https://idp.vsb.cz/idp/shibboleth':
      return 'VSB – Technical University of Ostrava';
    case 'https://whoami.cesnet.cz/idp/shibboleth':
      return 'CESNET';
    case 'https://helium.jcu.cz/idp/shibboleth':
      return 'University of South Bohemia';
    case 'https://idp.ujep.cz/idp/shibboleth':
      return 'Jan Evangelista Purkyne University in Usti nad Labem';
    case 'https://idp.amu.cz/idp/shibboleth':
      return 'Academy of Performing Arts in Prague';
    case 'https://idp.lib.cas.cz/idp/shibboleth':
      return 'Academy of Sciences Library';
    case 'https://shibboleth.mzk.cz/simplesaml/metadata.xml':
      return 'Moravian  Library';
    case 'https://idp2.ics.muni.cz/idp/shibboleth':
      return 'Masaryk University';
    case 'https://idp.upol.cz/idp/shibboleth':
      return 'Palacky University, Olomouc';
    case 'https://idp.fnplzen.cz/idp/shibboleth':
      return 'FN Plzen';
    case 'https://id.vse.cz/idp/shibboleth':
      return 'University of Economics, Prague';
    case 'https://shib.zcu.cz/idp/shibboleth':
      return 'University of West Bohemia';
    case 'https://idptoo.osu.cz/simplesaml/saml2/idp/metadata.php':
      return 'University of Ostrava';
    case 'https://login.ics.muni.cz/idp/shibboleth':
      return 'MetaCentrum';
    case 'https://idp.hostel.eduid.cz/idp/shibboleth':
      return 'eduID.cz Hostel';
    case 'https://shibboleth.techlib.cz/idp/shibboleth':
      return 'National Library of Technology';
    case 'https://eduid.jamu.cz/idp/shibboleth':
      return 'Janacek Academy of Music and Performing Arts in Brno';
    case 'https://marisa.uochb.cas.cz/simplesaml/saml2/idp/metadata.php':
      return 'Institute of Organic Chemistry and Biochemistry AS CR';
    case 'https://shibboleth.utb.cz/idp/shibboleth':
      return 'Tomas Bata University in Zlin';
    case 'https://engine.elixir-czech.org/authentication/idp/metadata':
      return 'Elixir Europe';
    case 'https://login.elixir-czech.org/idp':
      return 'Elixir Czech';
    case 'https://mojeid.cz/saml/idp.xml':
      return 'MojeID';
    case 'https://www.egi.eu/idp/shibboleth':
      return 'EGI SSO';

    case '@google.extidp.cesnet.cz':
      return 'Google';
    case '@facebook.extidp.cesnet.cz':
      return 'Facebook';
    case '@mojeid.extidp.cesnet.cz':
      return 'MojeID';
    case '@linkedin.extidp.cesnet.cz':
      return 'LinkedIn';
    case '@twitter.extidp.cesnet.cz':
      return 'Twitter';
    case '@seznam.extidp.cesnet.cz':
      return 'Seznam';
    case '@elixir-europe.org':
      return 'Elixir Europe';
    case '@github.extidp.cesnet.cz':
      return 'GitHub';
    case '@orcid.extidp.cesnet.cz':
      return 'OrcID';

    default: return name;
  }
}

export function createNewApplicationMail(): ApplicationMail {
  return { appType: 'INITIAL',
          formId: 0,
          mailType: 'APP_CREATED_USER',
          send: true,
          message: { ['en']: {locale: 'en', subject: '', text: ''},
            ['cs']: {locale: 'cs', subject: '', text: ''}} };
}


export function getDefaultDialogConfig(): MatDialogConfig {
  const config = new MatDialogConfig();
  config.disableClose = true;
  config.autoFocus = false;
  return config
}

export function createNewApplicationFormItem(): ApplicationFormItem {
  return { applicationTypes:['INITIAL', 'EXTENSION'],
          federationAttribute: '',
          i18n: { ['en']: {locale: 'en', errorMessage: '', help: '', label: '', options: ''},
            ['cs']: {locale: 'cs', errorMessage: '', help: '', label: '', options: ''}},
          id: 0,
          ordnum: 0,
          perunDestinationAttribute: null,
          perunSourceAttribute: null,
          regex: '',
          required: false,
          updatable: true,
          disabled: 'NEVER',
          hidden: 'NEVER',
          disabledDependencyItemId: null,
          hiddenDependencyItemId: null,
          shortname: '',
          type: null };
}

export function isVirtualAttribute(attribute: Attribute): boolean {
  return  attribute.namespace.split(':')[4] === 'virt';
}

export function parseMemberStatus(memberStatus: string, memberGroupStatus?:string): string {
  if(memberStatus.toLowerCase() === 'valid' && (!memberGroupStatus || memberStatus.toLowerCase() === 'valid')){
    return 'ACTIVE'
  }
  if(memberStatus.toLowerCase() === 'invalid'  ||  (memberGroupStatus && memberStatus.toLowerCase() === 'invalid')){
    return 'INACTIVE'
  }
  return memberStatus;
}

/**
 * Gets organization of given member. The Organization (for VO) has top priority, the Organization, provided by IDP
 * has lower priority. If there are no organizations, an empty string is returned.
 *
 * @param richMember RichMember
 */
export function parseOrganization(richMember: RichMember): string {

  let organization = '';

  if (richMember && richMember.memberAttributes !== null) {
    richMember.memberAttributes.forEach(attr => {
      if (attr.friendlyName === 'organization' && attr.value !== null) {
        organization = <string><unknown>attr.value;
      }
    });

    if (organization.length === 0 && richMember.userAttributes !== null) {
      richMember.userAttributes.forEach(attr => {
        if (attr.friendlyName === 'organization') {
          organization = <string><unknown>attr.value;
        }
      });
    }
  }
  return organization;
}

export function getGroupExpiration(group: RichGroup): string{
  const attribute = group.attributes.find(att => att.baseFriendlyName === 'groupMembershipExpiration');
  if(attribute && attribute.value){
    return attribute.value as unknown as string;
  }
  return 'Never';
}

export function parseDate(value: string): string{
  if(!value || value.toLowerCase() === 'never'){
    return value;
  }
  return formatDate(value, 'd.M.yyyy', 'en');
}

export function customDataSourceSort(data: any[], sort: MatSort, getDataForColumn: (data: any, column: string, outerThis: any) => string, outerThis:any){
  const active = sort.active;
  const direction = sort.direction;
  if (!active || direction === '') {
    return data;
  }
  return data.sort((a, b) => {
    const dataStrA = getDataForColumn(a, active, outerThis);
    const dataStrB = getDataForColumn(b, active, outerThis);
    const collator = new Intl.Collator('cs',{numeric: true});
    return collator.compare(dataStrA, dataStrB) * (direction === 'asc' ? 1 : -1);
  });
}

export function customDataSourceFilterPredicate(data: any, filter: string, columns: string[], getDataForColumn: (data: any, column: string, outerThis: any) => string, outerThis: any){
  filter = filter.toLowerCase();
  let dataStr = '';
  columns.forEach(col => {
    dataStr+= ';' + getDataForColumn(data, col, outerThis);
  });
  return dataStr.toLowerCase().indexOf(filter) !== -1;
}

export function parseAttribute(data: Author, nameOfAttribute: string) {
  let attribute = '';
  if (data.attributes) {
    data.attributes.forEach(attr => {
      if (attr.friendlyName === nameOfAttribute) {
        attribute = <string><unknown>attr.value;
      }
    });
  }
  return attribute;
}
