export const webDocumentTitle = {
  formatter: function formatDocumentTitle(options?: { title?: string }) {
    return options?.title ? `${options.title} | Janelinha` : "Janelinha";
  },
};
