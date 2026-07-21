import { Module, Global } from '@nestjs/common';
import {
  I18nModule as NestI18nModule,
  I18nJsonLoader,
  AcceptLanguageResolver,
} from 'nestjs-i18n';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

@Global()
@Module({
  imports: [
    NestI18nModule.forRoot({
      fallbackLanguage: 'en',
      loader: I18nJsonLoader,
      loaderOptions: {
        path: path.join(__dirname, '../../i18n/'),
        watch: false,
      },
      resolvers: [AcceptLanguageResolver],
    }),
  ],
  exports: [NestI18nModule],
})
export class I18nModule {}
