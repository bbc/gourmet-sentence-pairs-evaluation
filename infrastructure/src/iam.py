from troposphere import GetAtt, Output, Ref, Template, Parameter
from troposphere.iam import AccessKey, LoginProfile, PolicyType
from troposphere.iam import User


t = Template()

t.set_description("AWS CloudFormation Template. Creates a user with permission to access DynamoDB")

account_password = t.add_parameter(Parameter(
    "Password",
    Type="String",
    Description="Password to log into AWS with this account"
))

dynamouser = t.add_resource(User(
    "DynamoDBUser",
    UserName="DynamoDBAccess",
    LoginProfile=LoginProfile(Password=Ref(account_password)))
)

dynamokeys = t.add_resource(AccessKey(
    "DynamoKeys",
    Status="Active",
    UserName=Ref(dynamouser))
)

t.add_resource(PolicyType(
    "DynamoUserPolicies",
    PolicyName="DynamoUsers",
    Users=[Ref(dynamouser)],
    PolicyDocument={
        "Version": "2012-10-17",
        "Statement": [{
            "Effect": "Allow",
            "Action": [
                "dynamodb:**",
            ],
            "Resource": "*"
        }],
    }
))

t.add_output(Output(
    "AccessKey",
    Value=Ref(dynamokeys),
    Description="AWSAccessKeyId of new user",
))

t.add_output(Output(
    "SecretKey",
    Value=GetAtt(dynamokeys, "SecretAccessKey"),
    Description="AWSSecretKey of new user",
))

print(t.to_json())