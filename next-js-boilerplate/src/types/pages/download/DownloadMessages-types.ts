export interface DownloadMessages {
  [key: string]: string;
}

export interface PagesWithDownloadMessages {
  download: DownloadMessages;
}
