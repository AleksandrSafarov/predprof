# Generated by Django 4.1.5 on 2023-02-15 06:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('maps', '0007_rename_uid_route_userid'),
    ]

    operations = [
        migrations.AddField(
            model_name='route',
            name='distanceM',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='route',
            name='timeM',
            field=models.IntegerField(default=0),
        ),
    ]
