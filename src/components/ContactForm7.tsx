import { useEffect, useRef, useState } from "react";

type Props = {
  formId: string;
  formMarkup: string;
};
interface InvalidField {
  field: string;
  message: string;
  idref: null | string;
  error_id: string;
}

export default function ContactForm7({ formId, formMarkup }: Props) {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [generalErrorMessage, setGeneralErrorMessage] = useState<string>("");
  const formWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const submitHandler = async (e: SubmitEvent) => {
      e.preventDefault();
      // Supprimer les messages d'erreur existants avant de traiter la nouvelle soumission
      setShowErrorMessage(false);
      setErrorMessage("");
      const existingErrors =
        formWrapperRef.current?.querySelectorAll(".form-error");
      existingErrors?.forEach((error) => error.remove());

      try {
        if (formWrapperRef?.current) {
          const formElement =
            formWrapperRef.current.getElementsByTagName("form")?.[0];
          if (formElement) {
            const formData = new FormData(formElement);
            const response = await fetch(
              `${import.meta.env.PUBLIC_PROTOCOL}${import.meta.env.PUBLIC_WP_URL}/wp-json/contact-form-7/v1/contact-forms/${formId}/feedback`,
              {
                method: "POST",
                body: formData,
              },
            );
            const result = await response.json();

            if (result.status === "mail_sent") {
              // Traitement en cas de succès
              setShowSuccessMessage(true);
              setSuccessMessage(result.message);
              setTimeout(() => {
                setShowSuccessMessage(false);
              }, 4000);
              formElement.reset();
            } else if (result.status === "validation_failed") {
              // Traitement des erreurs de validation
              if (result.invalid_fields.length > 0) {
                setShowErrorMessage(true);
                setGeneralErrorMessage(result.message);
              } else null;
              setShowSuccessMessage(false);
              result.invalid_fields.forEach((field: InvalidField) => {
                const inputElement = formElement.querySelector(
                  `[name="${field.field}"]`,
                ) as HTMLInputElement;

                if (inputElement) {
                  let message = field.message;

                  // Si le champ en cours est le champ du quiz et que sa valeur est vide, ajustez le message d'erreur.
                  if (field.field === "quiz-672" && inputElement.value === "") {
                    message = "Vous n’avez pas répondu au quiz.";
                  }

                  // Créer et insérer l'élément d'erreur uniquement si le parent existe.
                  if (inputElement.parentNode) {
                    const errorElement = document.createElement("div");
                    errorElement.textContent = message;
                    errorElement.className = "form-error"; // Utilisez cette classe pour styliser l'erreur
                    inputElement.parentNode.insertBefore(
                      errorElement,
                      inputElement.nextSibling,
                    );
                  }
                } else {
                  // Gestion de l'absence de l'élément ou de son parent.
                  console.warn(`Element not found for field: ${field.field}`);
                }
              });
            } else if (result.status === "acceptance_missing") {
              // Traitement des erreurs d'acceptation
              setShowErrorMessage(true);
              setErrorMessage(result.message);
            }
          }
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        setShowErrorMessage(true);
        setErrorMessage(
          "Une erreur est survenue lors de l'envoi du formulaire.",
        );
      }
    };

    // Ajouter et retirer l'écouteur d'événements
    if (formWrapperRef?.current) {
      const formElement =
        formWrapperRef.current.getElementsByTagName("form")?.[0];
      if (formElement) {
        formElement.addEventListener("submit", submitHandler);
        return () => formElement.removeEventListener("submit", submitHandler);
      }
    }
  }, [formId, formWrapperRef]);

  return (
    <>
      {showSuccessMessage && (
        <div className="bg-green-600 p-4 text-white font-bold">
          <p>{successMessage}</p>
        </div>
      )}
      {showErrorMessage && (
        <div className="bg-red-600 p-4 my-4 rounded-md text-white font-bold">
          <p>{errorMessage ? errorMessage : generalErrorMessage}</p>
        </div>
      )}
      <div
        className="max-w-[--content-size] mx-auto"
        ref={formWrapperRef}
        dangerouslySetInnerHTML={{ __html: formMarkup }}
      />
    </>
  );
}
