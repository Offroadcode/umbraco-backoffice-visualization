using System.Collections.Generic;

namespace DocTypeVisualiser.Models
{
    public class DocTypeAnalyzerResult
    {
        public DocTypeAnalyzerResult()
        {
            DocumentTypes = new List<DocTypeModel>();
            Compositions = new List<CompositionModel>();
        }
        public List<DocTypeModel> DocumentTypes { get; set; }
        public List<CompositionModel> Compositions { get; set; }
    }
}