import sys

from troposphere import Parameter, Ref, Template, Join
from troposphere.route53 import RecordSetGroup

t = Template()

t.set_version("2010-09-09")

hosted_zone_name = t.add_parameter(Parameter(
    "HostedZoneName",
    AllowedPattern=".*\.",
    Type="String",
    Description=("Domain to use with trailing dot (e.g. 'api.bbci.co.uk.', "
                 "'api.bbc.co.uk.', 'api.bbc.com.', 'files.bbci.co.uk.' "
                 "or 'tools.bbc.co.uk'.')")
))

environment = t.add_parameter(Parameter(
    "Environment",
    Default=".",
    AllowedPattern="\.(?:(?!live\.)\w+\.)?",
    Type="String",
    Description=("Environment name with leading and trailing dots (e.g. "
                 "'.int.', '.test.'). For your live component use '.' instead "
                 "of '.live.'")
))

component_cname = t.add_parameter(Parameter(
    "ComponentName",
    Type="String",
    Description="Your component name"
))

backend = t.add_parameter(Parameter(
    "Backend",
    Default="d5120463d1901a16.xhst.bbci.co.uk",
    Type="String",
    Description=("Backend hostname for your component (e.g. '[component-name]."
                 "[env.]account-identifier.xhst.bbci.co.uk')")
))

record_set_group = t.add_resource(RecordSetGroup(
    "RecordSetGroup",
    HostedZoneName=Ref(hosted_zone_name),
    RecordSets=[{
        "Name": Join(
            "", [Ref(component_cname), Ref(environment), Ref(hosted_zone_name)]
        ),
        "Type": "CNAME",
        "TTL": "3600",
        "ResourceRecords": [
            Join("", [Ref(component_cname), Ref(environment), Ref(backend)])
        ]
    }]
))

template = t.to_json()
if len(sys.argv) > 1:
    open(sys.argv[1], "w").write(template + "\n")
else:
    print(template)
