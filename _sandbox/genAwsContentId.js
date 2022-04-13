/* Build S3 id (aka path) where suffix resolved in precedence order. This allows you
   to pass multiple suffixes. If one is undefined it will use the other. For example, if you pass
   slug as sfx1 and title as sfx2 and slug is undefined, the title will be used   */
const awsS3IdBuild = (acctId, domainName, sfx1, sfx2, sf3) => {
  let suffix = sfx1 || sfx2 || sf3
  return `${acct_id}/${domainName}/${suffix}`;
}

const awsS3IdSplit  = (s3Id) => {
  return s3Id.split('/')
}

/* initialize acct Id and domain */
const acct_id = 100;
const domainName = "Dev";

/* run test when title is undefined; slug should be used as suffix */
let slug = "slug-name-is-here" 
let title = undefined;

let awsContentId = awsS3IdBuild(acct_id, domainName, slug, title);
console.log(">>> This is awsContentId constructed with slug") 
console.log(`awsContentId: ${awsContentId}`) 

/* run test when slug is undefined; title should be used as suffix */
slug = undefined;
title = "slug name is here";

awsContentId = awsS3IdBuild(acct_id, domainName, slug, title);
console.log(">>> This is awsContentId constructed with title") 
console.log(`awsContentId: ${awsContentId}`) 


/* run test to split up S3Id */
let [splitAcctId, splitDomainName, splitSuffix] = awsS3IdSplit(awsContentId);

console.log("This is the Spit up AwsContentId");
console.log(`acctId: ${splitAcctId}`);
console.log(`domainName: ${splitDomainName}`);
console.log(`suffix: ${splitSuffix}`);




