// src/adminConfig.js

export const config = {
  backend: {
    name: "git-gateway",
    branch: "main"
  },
  media_folder: "public/images/uploads",
  public_folder: "/images/uploads",
  collections: [
    {
      name: "actions",
      label: "Actions",
      files: [
        {
          label: "Toutes les Actions",
          name: "actions",
          file: "src/data/actions.json",
          fields: [
            {label: "Titre", name: "titre", widget: "string"},
            {label: "Date (Texte)", name: "infoPratique", widget: "string"},
            {label: "Date (ISO)", name: "dateISO", widget: "date"},
            {label: "Lieu", name: "lieu", widget: "string"},
            {label: "Lien Google Maps", name: "lienLieu", widget: "string"},
            {label: "Description", name: "description", widget: "text"},
            {label: "Lien Programme", name: "lienProgramme", widget: "string"}
          ]
        }
      ]
    },
    {
      name: "partenaires",
      label: "Partenaires",
      files: [
        {
          label: "Tous les Partenaires",
          name: "partenaires",
          file: "src/data/partenaires.json",
          fields: [
            {label: "Nom", name: "nom", widget: "string"},
            {label: "Logo (chemin)", name: "logo", widget: "string"},
            {label: "Description", name: "description", widget: "text"},
            {label: "Lien Google Maps", name: "lienAdresse", widget: "string"},
            {label: "Lien Site Web", name: "lienSite", widget: "string"}
          ]
        }
      ]
    },
    {
      name: "actus",
      label: "Actualités",
      files: [
        {
          label: "Toutes les Actualités",
          name: "actus",
          file: "src/data/actus.json",
          fields: [
            {label: "Titre", name: "titre", widget: "string"},
            {label: "Date (ISO)", name: "dateISO", widget: "date"},
            {label: "Catégorie", name: "categorie", widget: "select", options: ["Fac", "Pau"]},
            {label: "Description", name: "description", widget: "text"},
            {label: "Image (chemin)", name: "image", widget: "string"},
            {label: "Lien Externe", name: "lien", widget: "string"},
            {label: "Épinglé ?", name: "isPinned", widget: "boolean", default: false}
          ]
        }
      ]
    }
  ]
};