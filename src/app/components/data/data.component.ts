import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface AudioFile {
  name: string;
  url: string;
}

@Component({
  selector: 'app-data',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data.component.html',
  styleUrl: './data.component.css'
})
export class DataComponent implements OnInit {

  private API_KEY = 'AIzaSyCHsgrzPfOP62tGm7DLLNg-AHvfjEdYJT0'; // API Key Anda
  private FOLDER_ID = '184wE8TWMbQEE4FWT1dd6xY4R6JXhqlpJ';

  loading = false;
  errorMessage = '';
  trainData: AudioFile[] = [];
  testData: AudioFile[] = [];

  private fullTrainData: AudioFile[] = [];
  private fullTestData: AudioFile[] = [];

  private readonly MAX_TRAIN_DATA = 10;
  private readonly MAX_TEST_DATA = 5;

  private trainLoaded = false;
  private testLoaded = false;

  private currentAudio: HTMLAudioElement | null = null;
  private currentPlayingUrl: string | null = null;

  private getRandomSubset(files: AudioFile[], max: number): AudioFile[] {
    const shuffled = [...files].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(max, files.length));
  }

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadRootFolders();
  }

  loadRootFolders() {
    this.loading = true;
    this.errorMessage = '';
    this.trainData = [];
    this.testData = [];
    this.trainLoaded = false;
    this.testLoaded = false;

    console.log(' [DRIVE DEBUG] ========================');
    console.log(' [DRIVE DEBUG] Memulai proses load folder');
    console.log(' [DRIVE DEBUG] Folder ID:', this.FOLDER_ID);
    console.log(' [DRIVE DEBUG] API Key (first 10 chars):', this.API_KEY.substring(0, 10) + '...');

    // TEST 1: Coba akses folder root tanpa filter mimeType
    console.log('\n [TEST 1] Mencoba akses folder root...');
    const testUrl1 = `https://www.googleapis.com/drive/v3/files?q='${this.FOLDER_ID}'+in+parents&key=${this.API_KEY}`;
    console.log(' [TEST 1] URL:', testUrl1);

    this.http.get<any>(testUrl1).subscribe({
      next: (res) => {
        console.log(' [TEST 1] Berhasil! Response:', res);
        console.log(' [TEST 1] Jumlah file/folder ditemukan:', res.files?.length || 0);

        if (res.files && res.files.length > 0) {
          console.log(' [TEST 1] Daftar item:');
          res.files.forEach((file: any, index: number) => {
            console.log(`   ${index + 1}. Nama: "${file.name}", ID: ${file.id}, Tipe: ${file.mimeType}`);
          });
        } else {
          console.log(' [TEST 1] Tidak ada file/folder ditemukan');
        }

        // TEST 2: Coba dengan filter mimeType
        console.log('\n [TEST 2] Mencoba dengan filter audio...');
        const testUrl2 = `https://www.googleapis.com/drive/v3/files?q='${this.FOLDER_ID}'+in+parents+and+mimeType+contains+'audio'&key=${this.API_KEY}`;
        console.log(' [TEST 2] URL:', testUrl2);

        this.http.get<any>(testUrl2).subscribe({
          next: (res2) => {
            console.log(' [TEST 2] Berhasil! Response:', res2);
            console.log(' [TEST 2] Jumlah file audio:', res2.files?.length || 0);

            // TEST 3: Coba cari folder train dan test
            console.log('\n [TEST 3] Mencari folder train dan test...');
            const trainFolder = res.files?.find((f: any) => f.name.toLowerCase() === 'train');
            const testFolder = res.files?.find((f: any) => f.name.toLowerCase() === 'test');

            console.log(' [TEST 3] Folder train ditemukan?', trainFolder ? 'YA' : 'TIDAK');
            if (trainFolder) {
              console.log('   - ID:', trainFolder.id);
              console.log('   - Nama:', trainFolder.name);
              console.log('   - Tipe:', trainFolder.mimeType);
            }

            console.log(' [TEST 3] Folder test ditemukan?', testFolder ? 'YA' : 'TIDAK');
            if (testFolder) {
              console.log('   - ID:', testFolder.id);
              console.log('   - Nama:', testFolder.name);
              console.log('   - Tipe:', testFolder.mimeType);
            }

            // TEST 4: Jika train folder ada, coba lihat isinya
            if (trainFolder) {
              console.log('\n [TEST 4] Mencoba lihat isi folder train...');
              this.testFolderContents(trainFolder.id, 'train');
            }

            // TEST 5: Jika test folder ada, coba lihat isinya
            if (testFolder) {
              console.log('\n [TEST 5] Mencoba lihat isi folder test...');
              this.testFolderContents(testFolder.id, 'test');
            }

            // Lanjutkan dengan proses normal
            if (trainFolder) {
              this.loadFilesFromFolder(trainFolder.id, 'train');
            }
            if (testFolder) {
              this.loadFilesFromFolder(testFolder.id, 'test');
            }

            this.checkCompletion();
          },
          error: (err) => {
            console.error(' [TEST 2] Gagal!');
            this.logError(err);
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error(' [TEST 1] Gagal!');
        this.logError(err);
        this.loading = false;
        this.errorMessage = 'Gagal mengakses Google Drive. Cek console untuk detail.';
      }
    });
  }

  testFolderContents(folderId: string, type: string) {
    const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${this.API_KEY}`;

    this.http.get<any>(url).subscribe({
      next: (res) => {
        console.log(` [TEST ${type === 'train' ? '4' : '5'}] Isi folder ${type}:`);
        console.log(`   Jumlah item:`, res.files?.length || 0);

        if (res.files && res.files.length > 0) {
          res.files.forEach((file: any, index: number) => {
            console.log(`   ${index + 1}. File: "${file.name}"`);
            // console.log(`      - ID: ${file.id}`);
            // console.log(`      - Tipe: ${file.mimeType}`);
            // console.log(`      - Ukuran: ${file.size || 'Tidak diketahui'}`);
          });
        } else {
          console.log(`   Folder ${type} kosong`);
        }
      },
      error: (err) => {
        console.error(` [TEST ${type === 'train' ? '4' : '5'}] Gagal melihat isi folder ${type}`);
        this.logError(err);
      }
    });
  }

  loadFilesFromFolder(folderId: string, type: 'train' | 'test') {
    const query = `'${folderId}' in parents and mimeType contains 'audio/'`;
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&key=${this.API_KEY}`;

    // console.log(`\n [LOAD] Memuat file dari folder ${type}:`, folderId);
    // console.log('[LOAD] URL:', url);

    this.http.get<any>(url).subscribe({
      next: (res) => {
        console.log(` [LOAD] Berhasil memuat folder ${type}`);
        console.log(` [LOAD] Jumlah file audio di ${type}:`, res.files?.length || 0);

        const files = (res.files || []).map((file: any) => {
          console.log(`   - File: ${file.name} (${file.mimeType})`);
          return {
            name: file.name,
            url: `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&key=${this.API_KEY}`
          };
        });

        if (type === 'train') {
          this.fullTrainData = files;
          this.trainData = this.getRandomSubset(files, this.MAX_TRAIN_DATA);
        } else {
          this.fullTestData = files;
          this.testData = this.getRandomSubset(files, this.MAX_TEST_DATA);
        }

        this.checkCompletion();
      },
      error: (err) => {
        console.error(` [LOAD] Gagal memuat folder ${type}`);
        this.logError(err);
        this.checkCompletion();
      }
    });
  }

  checkCompletion() {
    // Cek apakah semua data sudah terisi
    if (this.trainData.length > 0 || this.testData.length > 0) {
      this.loading = false;
      console.log('\n [DRIVE DEBUG] Selesai!');
      console.log(' [SUMMARY] Train data:', this.trainData.length, 'files');
      console.log(' [SUMMARY] Test data:', this.testData.length, 'files');
    }
  }

  logError(err: any) {
    console.error(' Error details:');
    console.error('   - Status:', err.status);
    console.error('   - Status Text:', err.statusText);
    console.error('   - Message:', err.message);

    if (err.error) {
      console.error('   - Error response:', err.error);
      if (err.error.error) {
        console.error('   - Google API Error:', err.error.error);
        console.error('   - Error code:', err.error.error.code);
        console.error('   - Error message:', err.error.error.message);
        console.error('   - Error status:', err.error.error.status);
      }
    }
  }

  onRefresh(section: 'train' | 'test') {
    console.log(`\n [REFRESH] Merefresh data ${section}...`);
    if (section === 'train') {
      this.trainData = this.getRandomSubset(
        this.fullTrainData,
        this.MAX_TRAIN_DATA
      );
    } else {
      this.testData = this.getRandomSubset(
        this.fullTestData,
        this.MAX_TEST_DATA
      );
    }
  }

  playAudio(file: AudioFile) {
    // Jika klik file yang sama → jangan lakukan apa-apa
    if (this.currentPlayingUrl === file.url) {
      return;
    }

    // Stop audio sebelumnya jika ada
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
    }

    // Buat audio baru
    this.currentAudio = new Audio(file.url);
    this.currentPlayingUrl = file.url;

    this.currentAudio.play().catch(err => {
      console.error('Gagal memutar audio:', err);
    });

    // Jika selesai diputar, reset state
    this.currentAudio.onended = () => {
      this.currentPlayingUrl = null;
    };
  }
}
