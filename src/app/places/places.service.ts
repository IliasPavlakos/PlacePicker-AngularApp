import {Injectable, signal} from '@angular/core';

import {Place} from './place.model';
import {catchError, map, throwError} from "rxjs";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root',
})
export class PlacesService {

  constructor(private httpClient: HttpClient) {
  }

  private userPlaces = signal<Place[]>([]);

  loadedUserPlaces = this.userPlaces.asReadonly();

  loadAvailablePlaces() {
    return this.FetchPlaces('http://localhost:3000/places', 'Something went wrong fetching available places...');
  }

  loadUserPlaces() {
    return this.FetchPlaces("http://localhost:3000/user-places", 'Something went wrong fetching your favorite places...');
  }

  addPlaceToUserPlaces(placeId: string) {
    return this.httpClient
      .put(`http://localhost:3000/user-places/`, placeId);
  }

  removeUserPlace(place: Place) {
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
