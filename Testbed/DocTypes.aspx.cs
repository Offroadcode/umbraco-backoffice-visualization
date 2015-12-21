using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Newtonsoft.Json;

namespace Testbed
{
    public partial class DocTypes : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            var an = new DocTypeVisualiser.DocTypeAnalyzer();
            var data = an.Analyze();
            Response.Write(JsonConvert.SerializeObject(data));
        }
    }
}