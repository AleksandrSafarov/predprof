# Generated by Django 4.1.5 on 2023-02-19 13:00

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('maps', '0020_alter_historyroute_date_alter_historyroute_distancem_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='historyroute',
            old_name='distanceM',
            new_name='distance',
        ),
        migrations.RenameField(
            model_name='historyroute',
            old_name='timeM',
            new_name='time',
        ),
        migrations.RenameField(
            model_name='route',
            old_name='distanceM',
            new_name='distance',
        ),
        migrations.RenameField(
            model_name='route',
            old_name='timeM',
            new_name='time',
        ),
        migrations.RenameField(
            model_name='staticroute',
            old_name='distanceM',
            new_name='distance',
        ),
        migrations.RenameField(
            model_name='staticroute',
            old_name='timeM',
            new_name='time',
        ),
        migrations.AlterField(
            model_name='historyroute',
            name='date',
            field=models.DateTimeField(default=datetime.datetime(2023, 2, 19, 16, 0, 24, 361530)),
        ),
        migrations.AlterField(
            model_name='route',
            name='date',
            field=models.DateTimeField(default=datetime.datetime(2023, 2, 19, 16, 0, 24, 359324)),
        ),
    ]
