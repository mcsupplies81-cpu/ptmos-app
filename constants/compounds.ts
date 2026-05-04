export interface Compound {
  id: string;
  name: string;
  aliases: string[];
  category: 'peptide' | 'hormone' | 'nootropic' | 'antioxidant' | 'other';
  summary: string;
}

export const COMPOUNDS: Compound[] = [
  { id: 'bpc-157', name: 'BPC-157', aliases: ['Body Protection Compound 157'], category: 'peptide', summary: 'A synthetic peptide derived from a gastric protein, studied for its potential role in tissue repair, gut health, and injury recovery in preclinical research.' },
  { id: 'tb-500', name: 'TB-500', aliases: ['Thymosin Beta-4'], category: 'peptide', summary: 'A synthetic fragment of Thymosin Beta-4, investigated for potential wound healing, muscle repair, and anti-inflammatory properties in animal studies.' },
  { id: 'kpv', name: 'KPV', aliases: [], category: 'peptide', summary: 'A tripeptide derived from alpha-MSH, studied for potential anti-inflammatory and gut-protective properties in preclinical research.' },
  { id: 'ghk-cu', name: 'GHK-Cu', aliases: ['Copper peptide GHK'], category: 'peptide', summary: 'A naturally occurring copper-binding peptide studied for potential roles in skin regeneration, wound healing, and anti-aging in research settings.' },
  { id: 'cjc-1295', name: 'CJC-1295', aliases: [], category: 'peptide', summary: 'A synthetic GHRH analog investigated for its potential to stimulate growth hormone release. Often studied in combination with GHRP compounds.' },
  { id: 'ipamorelin', name: 'Ipamorelin', aliases: [], category: 'peptide', summary: 'A selective GHRP (growth hormone releasing peptide) studied for potential GH secretagogue effects with a reportedly favorable side-effect profile in research.' },
  { id: 'tesamorelin', name: 'Tesamorelin', aliases: [], category: 'peptide', summary: 'An FDA-approved GHRH analog indicated for HIV-associated lipodystrophy. Also investigated in research for metabolic and cognitive outcomes.' },
  { id: 'sermorelin', name: 'Sermorelin', aliases: [], category: 'peptide', summary: 'A GHRH analog formerly FDA-approved for GH deficiency in children. Studied for potential effects on GH secretion and body composition in adults.' },
  { id: 'mots-c', name: 'MOTS-c', aliases: [], category: 'peptide', summary: 'A mitochondria-derived peptide investigated for potential roles in metabolic regulation, insulin sensitivity, and aging research.' },
  { id: 'epitalon', name: 'Epitalon', aliases: ['Epithalon'], category: 'peptide', summary: 'A tetrapeptide studied for potential telomere-extending and anti-aging properties. Primarily investigated in animal and in vitro models.' },
  { id: 'nad-plus', name: 'NAD+', aliases: ['Nicotinamide adenine dinucleotide'], category: 'other', summary: 'A coenzyme essential for cellular energy metabolism and DNA repair, studied extensively in aging and metabolic research contexts.' },
  { id: 'retatrutide', name: 'Retatrutide', aliases: ['LY3437943'], category: 'peptide', summary: 'An investigational triple agonist (GIP, GLP-1, glucagon receptors) studied in clinical trials for obesity and metabolic conditions. Not yet FDA-approved.' },
  { id: 'semaglutide', name: 'Semaglutide', aliases: ['Ozempic', 'Wegovy'], category: 'peptide', summary: 'An FDA-approved GLP-1 receptor agonist indicated for type 2 diabetes and obesity management. Widely studied for cardiovascular and metabolic outcomes.' },
  { id: 'tirzepatide', name: 'Tirzepatide', aliases: ['Mounjaro', 'Zepbound'], category: 'peptide', summary: 'An FDA-approved dual GIP/GLP-1 receptor agonist indicated for type 2 diabetes and obesity. Demonstrated significant weight loss outcomes in clinical trials.' },
  { id: 'aod-9604', name: 'AOD-9604', aliases: [], category: 'peptide', summary: 'A modified fragment of human growth hormone studied for potential lipolytic (fat-burning) properties, without the growth-promoting effects of full HGH.' },
  { id: 'melanotan-2', name: 'Melanotan II', aliases: ['MT-2'], category: 'peptide', summary: 'A synthetic melanocortin receptor agonist studied for skin pigmentation and sexual function research. Investigational status; not FDA-approved.' },
  { id: 'pt-141', name: 'PT-141', aliases: ['Bremelanotide'], category: 'peptide', summary: 'An FDA-approved melanocortin receptor agonist indicated for hypoactive sexual desire disorder (HSDD) in premenopausal women.' },
  { id: 'thymosin-alpha-1', name: 'Thymosin Alpha-1', aliases: ['Tα1'], category: 'peptide', summary: 'A naturally occurring thymic peptide studied for immunomodulatory properties. Approved in some countries for hepatitis and certain immune conditions.' },
  { id: 'dsip', name: 'DSIP', aliases: ['Delta Sleep-Inducing Peptide'], category: 'peptide', summary: 'A neuropeptide investigated for potential roles in sleep regulation, stress modulation, and hormonal balance in research settings.' },
  { id: 'selank', name: 'Selank', aliases: [], category: 'nootropic', summary: 'A synthetic heptapeptide based on tuftsin, studied for anxiolytic and nootropic properties. Approved for research use in Russia; investigational elsewhere.' },
  { id: 'semax', name: 'Semax', aliases: [], category: 'nootropic', summary: 'A synthetic peptide based on ACTH, investigated for cognitive enhancement, neuroprotective effects, and stroke recovery research.' },
  { id: 'll-37', name: 'LL-37', aliases: ['Cathelicidin'], category: 'peptide', summary: 'A human host defense peptide with antimicrobial and immunomodulatory properties, studied for wound healing and infection research.' },
  { id: 'foxo4-dri', name: 'FOXO4-DRI', aliases: [], category: 'peptide', summary: 'A modified peptide investigated as a senolytic agent — studied for its potential ability to selectively clear senescent cells in preclinical models.' },
  { id: 'ss-31', name: 'SS-31', aliases: ['Elamipretide', 'MTP-131'], category: 'peptide', summary: 'A mitochondria-targeted peptide studied for cardioprotective and neuroprotective properties in preclinical and clinical research.' },
  { id: 'humanin', name: 'Humanin', aliases: [], category: 'peptide', summary: 'A mitochondria-derived peptide investigated for neuroprotective, cytoprotective, and metabolic effects in aging and disease research.' },
  { id: 'peg-mgf', name: 'PEG-MGF', aliases: ['Pegylated Mechano Growth Factor'], category: 'peptide', summary: 'A modified form of IGF-1 splice variant studied for potential muscle repair and satellite cell activation in exercise and injury research.' },
  { id: 'igf-1-lr3', name: 'IGF-1 LR3', aliases: ['Long R3 IGF-1'], category: 'peptide', summary: 'A long-acting analog of IGF-1 studied for anabolic and cellular growth research. Significantly longer half-life than native IGF-1.' },
  { id: 'follistatin', name: 'Follistatin', aliases: ['FST'], category: 'peptide', summary: 'A glycoprotein that inhibits myostatin and activin, studied for potential roles in muscle growth and reproductive biology research.' },
  { id: 'hexarelin', name: 'Hexarelin', aliases: [], category: 'peptide', summary: 'A synthetic GHRP studied for growth hormone secretagogue effects and potential cardioprotective properties in research models.' },
  { id: 'ghrp-2', name: 'GHRP-2', aliases: [], category: 'peptide', summary: 'A synthetic growth hormone releasing peptide investigated for GH secretagogue effects. Studied in both research and clinical contexts.' },
  { id: 'ghrp-6', name: 'GHRP-6', aliases: [], category: 'peptide', summary: 'One of the first synthetic GHRPs studied, known for potent GH release stimulation and appetite-stimulating properties in research.' },
  { id: 'kisspeptin-10', name: 'Kisspeptin-10', aliases: [], category: 'peptide', summary: 'A neuropeptide that stimulates GnRH release; studied for reproductive endocrinology research and potential fertility applications.' },
  { id: 'oxytocin', name: 'Oxytocin', aliases: [], category: 'peptide', summary: 'A hypothalamic neuropeptide involved in social bonding, labor, and lactation. Studied for potential anxiolytic and pro-social effects in research.' },
  { id: 'dihexa', name: 'Dihexa', aliases: [], category: 'nootropic', summary: 'An angiotensin IV analog studied for potential synaptogenic and cognitive enhancement properties in preclinical neurological research.' },
  { id: 'cerebrolysin', name: 'Cerebrolysin', aliases: [], category: 'nootropic', summary: 'A neuropeptide mixture derived from porcine brain proteins, studied for neuroprotective effects and cognitive outcomes in stroke and dementia research.' },
  { id: 'p21', name: 'P21', aliases: [], category: 'nootropic', summary: 'A synthetic peptide investigated for potential neurotrophic and cognitive enhancement properties in preclinical research models.' },
  { id: 'pinealon', name: 'Pinealon', aliases: [], category: 'nootropic', summary: 'A synthetic tripeptide studied for neuroprotective and antioxidant properties, particularly in aging and retinal research contexts.' },
  { id: 'cartalax', name: 'Cartalax', aliases: [], category: 'peptide', summary: 'A synthetic tetrapeptide studied for potential cartilage and connective tissue support in aging and joint health research.' },
  { id: 'bronchogen', name: 'Bronchogen', aliases: [], category: 'peptide', summary: 'A synthetic tetrapeptide investigated for potential protective effects on bronchial and lung tissue in aging-related research.' },
  { id: 'vesugen', name: 'Vesugen', aliases: [], category: 'peptide', summary: 'A synthetic tripeptide studied for potential vascular protective and anti-aging effects in preclinical cardiovascular research.' },
  { id: 'livagen', name: 'Livagen', aliases: [], category: 'peptide', summary: 'A synthetic tetrapeptide studied for potential hepatoprotective and immune-modulating properties in aging research.' },
  { id: 'thymalin', name: 'Thymalin', aliases: [], category: 'peptide', summary: 'A thymic extract peptide complex studied for immune-enhancing and anti-aging properties in Russian clinical and preclinical research.' },
  { id: 'glutathione', name: 'Glutathione', aliases: ['GSH', 'L-Glutathione'], category: 'antioxidant', summary: "The body's master antioxidant tripeptide, studied for detoxification, immune function, and oxidative stress reduction." },
  { id: 'l-carnitine', name: 'L-Carnitine', aliases: [], category: 'other', summary: 'An amino acid derivative essential for fatty acid transport into mitochondria, widely studied for energy metabolism and exercise performance.' },
  { id: 'hcg', name: 'HCG', aliases: ['Human Chorionic Gonadotropin'], category: 'hormone', summary: 'An FDA-approved hormone used for fertility treatment. Also studied in research contexts related to testosterone axis and luteinizing hormone stimulation.' },
  { id: 'testosterone', name: 'Testosterone', aliases: ['Test'], category: 'hormone', summary: 'The primary male androgen hormone. FDA-approved formulations exist for hypogonadism. Widely studied for effects on muscle, bone, libido, and cognition.' },
  { id: 'na-semax-amidate', name: 'N-Acetyl Semax Amidate', aliases: [], category: 'nootropic', summary: 'A modified, more potent form of Semax with an acetyl and amide modification for improved stability, studied for nootropic and neuroprotective properties.' },
  { id: 'ara-290', name: 'ARA-290', aliases: ['Cibinetide'], category: 'peptide', summary: 'An erythropoietin-derived peptide investigated for neuroprotective and anti-inflammatory properties, studied in clinical trials for neuropathic pain.' },
  { id: 'wolverine-stack', name: 'Wolverine Stack', aliases: ['BPC-TB Stack', 'BPC/TB/GHK'], category: 'other', summary: 'A popular research combination typically including BPC-157, TB-500, and GHK-Cu, studied for synergistic tissue repair and recovery properties in anecdotal and research contexts.' },
];

export function searchCompounds(query: string): Compound[] {
  const q = query.toLowerCase().trim();
  if (!q) return COMPOUNDS;
  return COMPOUNDS.filter(
    (c) =>
      c.name.toLowerCase().indexOf(q) !== -1 ||
      c.aliases.some((a) => a.toLowerCase().indexOf(q) !== -1) ||
      c.category.indexOf(q) !== -1
  );
}
