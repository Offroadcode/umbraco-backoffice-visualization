using System.Collections.Generic;
using Umbraco.Core.Models;

namespace BackOfficeVisualiser.Models
{
    public class DocTypeModel
    {
        public DocTypeModel()
        {
            Compositions = new List<int>();
            Properties = new List<int>();
        }
        public string Name { get; set; }
        public string Alias { get; set; }
        public int Id { get; set; }
        public int ParentId { get; set; }
        public List<int> Compositions { get; set; }
        public List<int> Properties { get; set; } 
    }
}