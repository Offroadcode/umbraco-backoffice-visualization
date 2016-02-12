using System.Collections.Generic;

namespace BackOfficeVisualiser.Models
{
    public class PropertyTypeAnalyzerResult
    {
        public PropertyTypeAnalyzerResult()
        {
            DocumentTypes = new List<DocTypeModel>();
            Properties = new List<PropertyTypeModel>();
        }
        public List<DocTypeModel> DocumentTypes { get; set; }
        public List<PropertyTypeModel> Properties { get; set; }
    }
}