using System;
using System.Linq;
using System.Web.Http;
using DocTypeVisualiser.Api.Attributes;
using DocTypeVisualiser.Models;
using umbraco.BusinessLogic;
using umbraco.BusinessLogic.Actions;
using Umbraco.Core.Models;
using Umbraco.Core.Models.Membership;
using Umbraco.Web.Editors;
using Umbraco.Web.WebApi;
#pragma warning disable 612,618
using Action = umbraco.BusinessLogic.Actions.Action;
#pragma warning restore 612,618

namespace DocTypeVisualiser.Api
{
    [IsBackOffice]
    [CamelCaseController]
    public class DocTypeVisualiserController : UmbracoAuthorizedJsonController
    {
        [HttpGet]
        public DocTypeAnalyzerResult GetViewModel()
        {
            var dta = new DocTypeAnalyzer();

            return dta.Analyze();
        }
    }
}