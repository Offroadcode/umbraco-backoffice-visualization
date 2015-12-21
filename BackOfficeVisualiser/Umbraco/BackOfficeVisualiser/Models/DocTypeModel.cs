using System.Collections.Generic;

namespace BackOfficeVisualiser.Models
{
    public class DocTypeModel
    {
        public DocTypeModel()
        {
            Compositions = new List<int>();
        }
        public string Name { get; set; }
        public string Alias { get; set; }
        public int Id { get; set; }
        public List<int> Compositions { get; set; } 
    }
}