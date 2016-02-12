using System.Collections.Generic;
using System.Linq;
using BackOfficeVisualiser.Models;
using umbraco.interfaces;
using Umbraco.Core;
using Umbraco.Core.Models;

namespace BackOfficeVisualiser
{
    public class PropertyTypeAnalyzer
    {
        public PropertyTypeAnalyzerResult Analyze()
        {
            var model = new PropertyTypeAnalyzerResult();
            
            var allDoctypes = ApplicationContext.Current.Services.ContentTypeService.GetAllContentTypes();
            var allProperties = ApplicationContext.Current.Services.DataTypeService.GetAllDataTypeDefinitions();

            foreach (var contentType in allDoctypes)
            {
                ProcessContentType(contentType, model);
            }

            foreach (var propertyType in allProperties)
            {
                ProcessPropertyType(propertyType, model);
            }

            return model;
        }

        private void ProcessContentType(IContentType contentType, PropertyTypeAnalyzerResult model)
        {
            var parentIds = contentType.CompositionIds();

            var docTypeModel = new DocTypeModel();
            var propertyList = contentType.PropertyTypes.Select(property => property.DataTypeDefinitionId).ToList();

            docTypeModel.Compositions = parentIds.ToList();
            docTypeModel.Alias = contentType.Alias;
            docTypeModel.Name = contentType.Name;
            docTypeModel.Id = contentType.Id;
            docTypeModel.ParentId = contentType.ParentId;
            docTypeModel.Properties = propertyList;
            model.DocumentTypes.Add(docTypeModel);
        }

        private void ProcessPropertyType(IDataTypeDefinition propertyType, PropertyTypeAnalyzerResult model)
        {
            var propertyTypeModel = new PropertyTypeModel();

            propertyTypeModel.Name = propertyType.Name;
            propertyTypeModel.Id = propertyType.Id;
            propertyTypeModel.Alias = propertyType.PropertyEditorAlias;
            
            model.Properties.Add(propertyTypeModel);
        }
    }
}