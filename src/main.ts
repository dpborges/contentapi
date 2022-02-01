import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';


// This the root, or main entry point into our application
// This launches the app on port 3000, by default
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
