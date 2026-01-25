export type MeasurementCategory = 'general' | 'circumference' | 'skinfold' | 'length';

export interface MeasurementGuideline {
  id: string;
  label: string;
  category: MeasurementCategory;
  instructions: string;
  image?: string; // Placeholder for future image
}

export const MEASUREMENT_GUIDELINES: Record<string, MeasurementGuideline> = {
  // General
  weight: {
    id: 'weight',
    label: 'Peso Corporeo',
    category: 'general',
    instructions: 'Pesarsi al mattino, a digiuno, dopo aver usato il bagno e senza vestiti. Usare sempre la stessa bilancia posizionata su una superficie dura e piana.'
  },
  height: {
    id: 'height',
    label: 'Altezza',
    category: 'general',
    instructions: 'Stare dritti contro un muro, senza scarpe, talloni uniti. Guardare dritto avanti. Misurare da terra alla sommità della testa.'
  },

  // Circumferences
  neck: {
    id: 'neck',
    label: 'Collo',
    category: 'circumference',
    instructions: 'Misurare nel punto più stretto, sotto il pomo d\'Adamo. Mantenere la testa dritta e rilassata.'
  },
  shoulders: {
    id: 'shoulders',
    label: 'Spalle',
    category: 'circumference',
    instructions: 'Misurare nel punto più largo delle spalle. Braccia rilassate lungo i fianchi. Il metro deve essere orizzontale.'
  },
  chest: {
    id: 'chest',
    label: 'Torace',
    category: 'circumference',
    instructions: 'Misurare all\'altezza dei capezzoli (uomini) o sotto le ascelle nel punto più largo (donne). Espirare normalmente prima di leggere.'
  },
  waist: {
    id: 'waist',
    label: 'Vita',
    category: 'circumference',
    instructions: 'Misurare nel punto più stretto tra le costole e le anche (solitamente sopra l\'ombelico). Espirare normalmente.'
  },
  hips: {
    id: 'hips',
    label: 'Fianchi',
    category: 'circumference',
    instructions: 'Misurare nel punto più largo dei glutei. Piedi uniti, metro orizzontale.'
  },
  
  // Arms
  bicep_left: {
    id: 'bicep_left',
    label: 'Bicipite SX',
    category: 'circumference',
    instructions: 'Braccio sinistro rilassato lungo il fianco. Misurare a metà tra spalla e gomito.'
  },
  bicep_right: {
    id: 'bicep_right',
    label: 'Bicipite DX',
    category: 'circumference',
    instructions: 'Braccio destro rilassato lungo il fianco. Misurare a metà tra spalla e gomito.'
  },
  forearm_left: {
    id: 'forearm_left',
    label: 'Avambraccio SX',
    category: 'circumference',
    instructions: 'Misurare nel punto più largo dell\'avambraccio sinistro, sotto il gomito.'
  },
  forearm_right: {
    id: 'forearm_right',
    label: 'Avambraccio DX',
    category: 'circumference',
    instructions: 'Misurare nel punto più largo dell\'avambraccio destro, sotto il gomito.'
  },
  wrist_left: {
    id: 'wrist_left',
    label: 'Polso SX',
    category: 'circumference',
    instructions: 'Misurare nel punto più stretto del polso sinistro, prima dell\'osso sporgente.'
  },
  wrist_right: {
    id: 'wrist_right',
    label: 'Polso DX',
    category: 'circumference',
    instructions: 'Misurare nel punto più stretto del polso destro, prima dell\'osso sporgente.'
  },

  // Legs
  thigh_left: {
    id: 'thigh_left',
    label: 'Coscia SX',
    category: 'circumference',
    instructions: 'Misurare nel punto più largo della coscia sinistra, appena sotto il gluteo.'
  },
  thigh_right: {
    id: 'thigh_right',
    label: 'Coscia DX',
    category: 'circumference',
    instructions: 'Misurare nel punto più largo della coscia destra, appena sotto il gluteo.'
  },
  calf_left: {
    id: 'calf_left',
    label: 'Polpaccio SX',
    category: 'circumference',
    instructions: 'Misurare nel punto più largo del polpaccio sinistro.'
  },
  calf_right: {
    id: 'calf_right',
    label: 'Polpaccio DX',
    category: 'circumference',
    instructions: 'Misurare nel punto più largo del polpaccio destro.'
  },
  ankle_left: {
    id: 'ankle_left',
    label: 'Caviglia SX',
    category: 'circumference',
    instructions: 'Misurare nel punto più stretto sopra il malleolo sinistro.'
  },
  ankle_right: {
    id: 'ankle_right',
    label: 'Caviglia DX',
    category: 'circumference',
    instructions: 'Misurare nel punto più stretto sopra il malleolo destro.'
  },

  // Skinfolds (Plicometria)
  skinfold_chest: {
    id: 'skinfold_chest',
    label: 'Plica Pettorale',
    category: 'skinfold',
    instructions: 'Uomini: metà distanza tra capezzolo e ascella. Donne: un terzo della distanza. Plica diagonale.'
  },
  skinfold_midaxillary: {
    id: 'skinfold_midaxillary',
    label: 'Plica Ascellare Media',
    category: 'skinfold',
    instructions: 'Sulla linea ascellare media, a livello dello sterno/seno. Plica verticale.'
  },
  skinfold_tricep: {
    id: 'skinfold_tricep',
    label: 'Plica Tricipite',
    category: 'skinfold',
    instructions: 'Metà distanza tra spalla e gomito, parte posteriore del braccio. Plica verticale.'
  },
  skinfold_subscapular: {
    id: 'skinfold_subscapular',
    label: 'Plica Sottoscapolare',
    category: 'skinfold',
    instructions: '1-2 cm sotto l\'angolo inferiore della scapola. Plica diagonale (45 gradi).'
  },
  skinfold_abdominal: {
    id: 'skinfold_abdominal',
    label: 'Plica Addominale',
    category: 'skinfold',
    instructions: '2 cm a destra dell\'ombelico. Plica verticale.'
  },
  skinfold_suprailiac: {
    id: 'skinfold_suprailiac',
    label: 'Plica Sovrailiaca',
    category: 'skinfold',
    instructions: 'Sopra la cresta iliaca (osso dell\'anca), sulla linea ascellare anteriore. Plica diagonale.'
  },
  skinfold_thigh: {
    id: 'skinfold_thigh',
    label: 'Plica Coscia',
    category: 'skinfold',
    instructions: 'Metà distanza tra inguine e rotula, parte anteriore della coscia. Peso sulla gamba opposta. Plica verticale.'
  },
};

export const MEASUREMENT_CATEGORIES: {id: MeasurementCategory; label: string}[] = [
  { id: 'general', label: 'Generale' },
  { id: 'circumference', label: 'Circonferenze' },
  { id: 'skinfold', label: 'Plicometria' },
  { id: 'length', label: 'Lunghezze' },
];
