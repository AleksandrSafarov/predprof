# Generated by Django 4.1.5 on 2023-02-14 12:16

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('maps', '0006_rename_userid_route_uid'),
    ]

    operations = [
        migrations.RenameField(
            model_name='route',
            old_name='uId',
            new_name='userId',
        ),
    ]