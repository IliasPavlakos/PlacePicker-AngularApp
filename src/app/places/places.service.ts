import {Injectable, signal} from '@angular/core';

import {Place} from './place.model';
import {catchError, map, tap, throwError} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {ErrorService} from "../shared/error.service";

@Injectable({
  providedIn: 'root',
})
export class PlacesService {

  constructor(private httpClient: HttpClient, private errorService: ErrorService) {}

  private userPlaces = signal<Place[]>([]);


  loadedUserPlaces = this.userPlaces.asReadonly();

  loadAvailablePlaces() {
    return this.FetchPlaces('http://localhost:3000/places', 'Something went wrong fetching available places...');
  }

  loadUserPlaces() {
    return this.FetchPlaces("http://localhost:3000/user-places", 'Something went wrong fetching your favorite places...')
      .pipe(tap({
        next: (userPlaces) =>  this.userPlaces.set(userPlaces),
      }));
  }

  addPlaceToUserPlaces(place: Place) {
    const prevPlaces = this.userPlaces();

    if(!prevPlaces.some(p => p.id === place.id)) {
      this.userPlaces.update(places => [...places, place]);
    }

    // If http request fails the user has a wrong view
    // Can add same place twice
    return this.httpClient
      .put(`http://localhost:3000/user-places/`, { placeId: place.id })
      .pipe(catchError(() => {
        this.userPlaces.set(prevPlaces);
        this.errorService.showError('Failed to store selected place.')
        return throwError(() => new Error('Failed to store selected place.'));
      }))
  }

  removeUserPlace(place: Place) {
    const prevPlaces = this.userPlaces();

    if(prevPlaces.some(p => p.id === place.id)) {
      this.userPlaces.set(prevPlaces.filter(p => p.id !== place.id));
    }

    // If http request fails the user has a wrong view
    // Can add same place twice
    return this.httpClient
      .delete(`http://localhost:3000/user-places/` + place.id)
      .pipe(catchError(() => {
        this.userPlaces.set(prevPlaces);
        this.errorService.showError('Failed to remove selected favorite place.')
        return throwError(() => new Error('Failed to remove selected favorite place.'));
      }))
  }

  private FetchPlaces(url: string, errorMessage: string) {
    return this.httpClient
      .get<{ places: Place[] }>(url)
      .pipe(
        map(responseData => responseData.places),
        catchError((error) => throwError(() => new Error(errorMessage))),
      );
  }
}
