# Importing Existing Glossaries

## Plan for production and staging

### From the Lara database, gather a list of glossaries used including author and the authored state which includes the glossary json file saved on S3

servers (passwords in CloudFormation)

- staging: lara-staging-vpc.cheea3ib6y8u.us-east-1.rds.amazonaws.com
- production: lara-vpc.cheea3ib6y8u.us-east-1.rds.amazonaws.com

SQL query:

```
select u.email, p.author_data, la.name, la.publication_status, pr.title as project, la.portal_run_count, la.created_at
from plugins p
join lightweight_activities la on la.id = p.plugin_scope_id
join users u on u.id = la.user_id
left join projects pr on pr.id = la.project_id
where p.approved_script_id  = 6 and p.plugin_scope_type = 'LightweightActivity'
order by pr.title, u.email, la.portal_run_count desc
```

### From the token service Firestore database, gather a list of "glossary" tools used which maps the glossary name to the S3 json url

1. Download `fuego` (https://sgarciac.github.io/fuego/)
1. Download the private key for production or staging token-service from 1Password or generate a new one using the Firebase project settings window
2. Run `fuego --credentials JSON-FILE query production:resources "tool == 'glossary'"`

This generates output that looks like:

```
{
    "CreateTime": "2020-05-20T18:51:02.607457Z",
    "Data": {
        "accessRules": [
            {
                "platformId": "https://learn.concord.org",
                "role": "owner",
                "type": "user",
                "userId": "https://learn.concord.org/users/97075"
            }
        ],
        "bucket": "models-resources",
        "description": "For Activities 1-10 in Evolution Readiness",
        "folder": "glossary-resources",
        "name": "ER Glossary",
        "region": "us-east-1",
        "tool": "glossary",
        "type": "s3Folder"
    },
    "ID": "zE3QYVz8xJxomOQVvEbc",
    "Path": "projects/token-service-62822/databases/(default)/documents/production:resources/zE3QYVz8xJxomOQVvEbc",
    "ReadTime": "2022-05-10T10:49:02.464348Z",
    "UpdateTime": "2020-05-20T18:51:02.607457Z"
}
```

The `Data.name` attribute is the glossary name (in this case "ER Glossary") and the JSON url is the ID value (in this case zE3QYVz8xJxomOQVvEbc/glossary.json )

This can be extracted using `jq` using: `jq '.[] | {name: .Data.name, id: .ID, user: .Data.accessRules[0].userId, userRole: .Data.accessRules[0].role}' glossaries.json`


### Cull which glossaries don't need to be imported

This is manual.

### Manually create logins on the lara2 servers for all glossary authors and gather a mapping of emails to user ids

This is manual.  Once the culled glossaries are found an admin can "become" each user on the portal and then login to the lara2 servers to create an account.  A computer readable document will need to be kept mapping emails to user ids.

### Write a script that reads the list of glossaries and the Firebase data and creates SQL statements to create the glossaries attributed to the original authors

Psuedo-code:

```
readLaraDatabaseDataAndParseAuthoredState()
readFirestoreData()
readUserIds()
FOR EACH DISTINCT glossary in authored state
  Find glossary resource in Firestore data
  Find email in user id mapping
  Construct json url and load json into memory
  Output SQL to create glossary
```