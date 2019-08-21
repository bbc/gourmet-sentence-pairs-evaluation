from cosmosTroposphere import CosmosTemplate
t = CosmosTemplate(description="GoURMET Translation UI",
                   project_name="gourmet", component_name="translation-ui")
print(t.to_json())
