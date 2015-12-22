using System.Linq;
using BackOfficeVisualiser.Models;
using Umbraco.Core;
using Umbraco.Core.Models;

namespace BackOfficeVisualiser
{
    public class DocTypeAnalyzer
    {
        public DocTypeAnalyzerResult Analyze()
        {
            var model = new DocTypeAnalyzerResult();
            var allDoctypes = ApplicationContext.Current.Services.ContentTypeService.GetAllContentTypes();

            foreach (var contentType in allDoctypes)
            {
                ProcessContentType(contentType, model);
            }

            return model;
        }

        private void ProcessContentType(IContentType contentType, DocTypeAnalyzerResult model)
        {
            var parentIds = contentType.CompositionIds();
            var docTypeModel = new DocTypeModel();

            docTypeModel.Compositions = parentIds.ToList();
            docTypeModel.Alias = contentType.Alias;
            docTypeModel.Name = contentType.Name;
            docTypeModel.Id = contentType.Id;
            docTypeModel.ParentId = contentType.ParentId;
            model.DocumentTypes.Add(docTypeModel);

        }
    }
}