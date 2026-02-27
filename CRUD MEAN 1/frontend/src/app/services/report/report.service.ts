import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ClientInfo {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
}

export interface CategorieInfo {
  _id: string;
  nom: string;
}

export interface BoutiqueInfo {
  _id: string;
  nom: string;
  email?: string;
  telephone?: string;
  boxActuelleId?: string;
  categorieId?: CategorieInfo;
}

export interface Report {
  _id: string;
  clientId: ClientInfo | string | null;
  boutiqueId: BoutiqueInfo;
  title: string;
  description?: string;
  commentaire?: string;
  dateReport: Date;
  dateValidation?: Date;
  statut: 'en_attente' | 'valide' | 'refuse';
  createdAt?: string;
  updatedAt?: string;
}

// Interface pour la création d'un report (IDs en string)
export interface CreateReportDTO {
  clientId: string | null;
  boutiqueId: BoutiqueInfo | string;  // Ici c'est un string (l'ID)
  title: string;
  description?: string;
  dateReport: Date;
  statut?: 'en_attente' | 'valide' | 'refuse';
}

export interface ReportResponse {
  statut: 'valide' | 'refuse';
  commentaire: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  // Récupérer tous les reports (pour admin)
  getAllReports(): Observable<Report[]> {
    return this.http.get<Report[]>(`${this.apiUrl}`);
  }

  // Récupérer un report par ID
  getReportById(id: string): Observable<Report> {
    return this.http.get<Report>(`${this.apiUrl}/${id}`);
  }

 // Créer un report - utilise CreateReportDTO
  createReport(report: CreateReportDTO): Observable<Report> {
    return this.http.post<Report>(`${this.apiUrl}`, report);
  }

  // Répondre à un report (valider/refuser)
  respondToReport(id: string, response: ReportResponse): Observable<Report> {
    return this.http.put<Report>(`${this.apiUrl}/respond/${id}`, response);
  }

  // Récupérer les reports d'un client
  getClientReports(clientId: string): Observable<Report[]> {
    return this.http.get<Report[]>(`${this.apiUrl}/client/${clientId}`);
  }

  // Mettre à jour un report
  updateReport(id: string, report: Partial<Report>): Observable<Report> {
    return this.http.put<Report>(`${this.apiUrl}/${id}`, report);
  }

  // Supprimer un report
  deleteReport(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}