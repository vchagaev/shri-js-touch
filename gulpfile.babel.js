'use strict';

import gulp from 'gulp';
import browserSync from 'browser-sync';

const bSync = browserSync.create();

gulp.task('default', () => {
    bSync.init({
        server: 'sample/'
    });
    gulp.watch('sample/**/*').on('change', bSync.reload);
});
